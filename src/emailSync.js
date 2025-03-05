// src/services/emailSync.js
import { supabase } from "../supabaseClient";

export async function syncEmails() {
  try {
    // 1. Hent den nåværende brukerøkten for å få tilgang til tokens
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Ingen aktiv økt funnet');
    
    const { provider_token } = session;
    if (!provider_token) throw new Error('Ingen tilgangsnøkkel for Google funnet');
    
    // 2. Hent e-poster fra Gmail API (maks 50 nyeste)
    const response = await fetch('https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=50', {
      headers: {
        Authorization: `Bearer ${provider_token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Gmail API error: ${response.status}`);
    }
    
    const data = await response.json();
    const messageIds = data.messages || [];
    
    // 3. For hver e-post-ID, hent detaljert e-postinformasjon
    for (const { id: messageId } of messageIds) {
      // Sjekk om vi allerede har denne e-posten i databasen
      const { data: existingEmail } = await supabase
        .from('emails')
        .select('id')
        .eq('message_id', messageId)
        .eq('user_id', session.user.id)
        .maybeSingle();
        
      if (existingEmail) {
        // E-posten eksisterer allerede, hopp over
        continue;
      }
      
      // Hent e-post-detaljer
      const messageResponse = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`, {
        headers: {
          Authorization: `Bearer ${provider_token}`
        }
      });
      
      if (!messageResponse.ok) {
        console.error(`Kunne ikke hente e-post ${messageId}:`, messageResponse.status);
        continue;
      }
      
      const messageData = await messageResponse.json();
      
      // Parsing av e-postdataene
      const headers = messageData.payload.headers;
      const subject = headers.find(h => h.name.toLowerCase() === 'subject')?.value || '(Ingen emne)';
      const from = headers.find(h => h.name.toLowerCase() === 'from')?.value || '';
      const to = headers.find(h => h.name.toLowerCase() === 'to')?.value || '';
      
      // Enkelt parsing av avsenderinformasjon
      let fromEmail = from;
      let fromName = '';
      
      const fromMatch = from.match(/(.*)\s*<(.*)>/);
      if (fromMatch) {
        fromName = fromMatch[1].trim();
        fromEmail = fromMatch[2].trim();
      }
      
      // Finn og dekoder e-postens innhold
      let bodyText = '';
      let bodyHtml = '';
      
      function findBodyParts(part) {
        if (part.mimeType === 'text/plain' && part.body.data) {
          bodyText = atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
        } else if (part.mimeType === 'text/html' && part.body.data) {
          bodyHtml = atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
        } else if (part.parts) {
          part.parts.forEach(findBodyParts);
        }
      }
      
      if (messageData.payload.parts) {
        messageData.payload.parts.forEach(findBodyParts);
      } else if (messageData.payload.body && messageData.payload.body.data) {
        if (messageData.payload.mimeType === 'text/plain') {
          bodyText = atob(messageData.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
        } else if (messageData.payload.mimeType === 'text/html') {
          bodyHtml = atob(messageData.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
        }
      }
      
      // Lagre e-posttil Supabase
      const emailRecord = {
        user_id: session.user.id,
        message_id: messageId,
        from_email: fromEmail,
        from_name: fromName,
        to_email: to,
        subject,
        body_text: bodyText,
        body_html: bodyHtml,
        snippet: messageData.snippet || '',
        received_at: new Date(parseInt(messageData.internalDate)).toISOString()
      };
      
      const { error: insertError } = await supabase
        .from('emails')
        .insert(emailRecord);
        
      if (insertError) {
        console.error('Feil ved lagring av e-post:', insertError);
      }
    }
    
    return { success: true, count: messageIds.length };
  } catch (error) {
    console.error('E-post synkroniseringsfeil:', error);
    throw error;
  }
}