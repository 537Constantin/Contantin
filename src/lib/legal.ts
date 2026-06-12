/**
 * Central company/legal details rendered in Impressum, Datenschutzerklärung
 * and AGB. Editing here updates all pages.
 *
 * Noch zu ergänzen (für eine GmbH gesetzlich erforderlich, sobald vorhanden):
 *  - registerCourt + registerNumber (Handelsregister: Amtsgericht + HRB-Nummer)
 *  - vatId (USt-IdNr., sobald vom Finanzamt vergeben)
 *  - phone (optional)
 */
export const legal = {
  companyName: "Konstantin König GmbH",
  representative: "Konstantin König", // Geschäftsführer
  street: "Korngrube 17",
  postalCode: "35510",
  city: "Butzbach",
  country: "Deutschland",
  email: "lenaaiber@proton.me",
  phone: "", // optional – noch nicht angegeben
  vatId: "", // USt-IdNr. – noch nicht vorhanden
  registerCourt: "", // z. B. "Amtsgericht Friedberg (Hessen)"
  registerNumber: "", // z. B. "HRB 12345"
  contentResponsible: "Konstantin König",
  lastUpdated: "12. Juni 2026",
} as const;
