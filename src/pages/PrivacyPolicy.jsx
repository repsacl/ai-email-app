import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Mail } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center mb-8">
          <Mail className="h-8 w-8 text-blue-600 mr-2" />
          <h1 className="text-3xl font-bold text-gray-900">repsac.no</h1>
        </div>
        
        <Card className="mb-8 shadow-lg">
          <CardHeader className="border-b bg-gray-50">
            <CardTitle className="text-center text-2xl font-bold text-gray-900">
              Personvernerklæring for repsac.no
            </CardTitle>
            <p className="text-center text-gray-500 mt-2">Sist oppdatert: 09.03.2025</p>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-gray-700 mb-6">
              repsac verdsetter personvernet ditt og er forpliktet til å beskytte dine personopplysninger. 
              Denne personvernerklæringen forklarer hvordan vi samler inn, bruker og beskytter 
              informasjonen din når du bruker vår AI-drevne e-posttjeneste.
            </p>
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-lg font-medium">
                  1. Informasjon vi samler inn
                </AccordionTrigger>
                <AccordionContent className="pt-4 pb-2">
                  <p className="mb-4">Vi samler inn følgende typer informasjon:</p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li>
                      <span className="font-medium">Kontoinformasjon:</span> For å bruke appen må du logge inn med en e-postkonto. 
                      Vi mottar grunnleggende informasjon som e-postadresse og navn fra e-postleverandøren din.
                    </li>
                    <li>
                      <span className="font-medium">E-postdata:</span> Vi samler inn og analyserer innholdet i e-postene 
                      dine for å muliggjøre AI-funksjonalitet som oppsummering og assistering med svar.
                    </li>
                    <li>
                      <span className="font-medium">Bruksdata:</span> Vi samler inn informasjon om hvordan du bruker appen, 
                      som interaksjoner med AI-assistenten og innstillinger.
                    </li>
                    <li>
                      <span className="font-medium">Enhetsdata:</span> Vi kan samle inn informasjon om enheten du bruker, 
                      som operativsystem, nettlesertype og IP-adresse.
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-lg font-medium">
                  2. Hvordan vi bruker informasjonen
                </AccordionTrigger>
                <AccordionContent className="pt-4 pb-2">
                  <p className="mb-4">Vi bruker informasjonen din til følgende formål:</p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li>
                      <span className="font-medium">Tilgang til og administrasjon av e-post:</span> Vi kobler til e-postkontoen 
                      din for å vise, sende og administrere e-postmeldinger.
                    </li>
                    <li>
                      <span className="font-medium">AI-assistanse:</span> Vår AI analyserer innholdet i e-postene dine for å 
                      gi oppsummeringer, forslag til svar og annen assistanse.
                    </li>
                    <li>
                      <span className="font-medium">Forbedring av tjenesten:</span> Vi bruker anonymiserte data til å 
                      forbedre AI-modellen og brukeropplevelsen.
                    </li>
                    <li>
                      <span className="font-medium">Sikkerhet og forebygging av misbruk:</span> Vi overvåker bruken for å 
                      forhindre uautorisert tilgang og misbruk.
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3">
                <AccordionTrigger className="text-lg font-medium">
                  3. Hvordan vi deler informasjon
                </AccordionTrigger>
                <AccordionContent className="pt-4 pb-2">
                  <p className="mb-4">Vi deler ikke informasjonen din med tredjeparter, bortsett fra i følgende tilfeller:</p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li>
                      <span className="font-medium">Med e-postleverandøren din:</span> For å koble til og administrere e-poster på dine vegne.
                    </li>
                    <li>
                      <span className="font-medium">Med tjenesteleverandører:</span> Vi bruker tredjeparter til drift av infrastruktur, 
                      AI-modeller og sikkerhetstiltak. Disse har strenge avtaler for å beskytte personopplysningene dine.
                    </li>
                    <li>
                      <span className="font-medium">Ved lovkrav:</span> Dersom vi er pålagt å utlevere informasjon for å 
                      overholde juridiske forpliktelser.
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4">
                <AccordionTrigger className="text-lg font-medium">
                  4. Dine rettigheter
                </AccordionTrigger>
                <AccordionContent className="pt-4 pb-2">
                  <p className="mb-4">Du har rett til å:</p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li>Få tilgang til informasjonen din</li>
                    <li>Be om retting eller sletting</li>
                    <li>Begrense eller protestere mot behandling</li>
                    <li>Trekke tilbake samtykke</li>
                    <li>Eksportere dataene dine</li>
                  </ul>
                  <p className="mt-4">
                    For å utøve disse rettighetene, kontakt oss på caslandberg@gmail.com.
                  </p>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-5">
                <AccordionTrigger className="text-lg font-medium">
                  5. Sikkerhetstiltak
                </AccordionTrigger>
                <AccordionContent className="pt-4 pb-2">
                  <p className="text-gray-700">
                    Vi implementerer tekniske og organisatoriske tiltak for å beskytte dine data, 
                    inkludert kryptering, tilgangskontroll og kontinuerlig overvåking.
                  </p>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-6">
                <AccordionTrigger className="text-lg font-medium">
                  6. Lagring og sletting av data
                </AccordionTrigger>
                <AccordionContent className="pt-4 pb-2">
                  <p className="text-gray-700">
                    Vi lagrer informasjonen din så lenge det er nødvendig for å tilby tjenesten. 
                    Du kan be om sletting av dataene dine når som helst.
                  </p>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-7">
                <AccordionTrigger className="text-lg font-medium">
                  7. Endringer i personvernerklæringen
                </AccordionTrigger>
                <AccordionContent className="pt-4 pb-2">
                  <p className="text-gray-700">
                    Vi kan oppdatere denne erklæringen ved behov. Du vil bli varslet om vesentlige endringer.
                  </p>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-8">
                <AccordionTrigger className="text-lg font-medium">
                  8. Kontakt oss
                </AccordionTrigger>
                <AccordionContent className="pt-4 pb-2">
                  <p className="text-gray-700">
                    Hvis du har spørsmål om personvern, kontakt oss på
                    <a href="mailto:caslandberg@gmail.com" className="text-blue-600 hover:underline ml-1">
                      caslandberg@gmail.com
                    </a>.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-center text-gray-600 text-sm">
                Ved å bruke repsac.no samtykker du til behandling av dine data i henhold til denne personvernerklæringen.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;