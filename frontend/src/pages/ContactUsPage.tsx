import { motion } from "framer-motion";

const contacts = [
  {
    title: "BrightBridge Support Center",
    line1: "Near Inclusive Learning Block",
    line2: "Chennai, Tamil Nadu 600001",
    line3: "Phone: +91 98765 43210",
  },
  {
    title: "Disability Students Trust",
    line1: "Hope Access Trust Campus",
    line2: "Coimbatore, Tamil Nadu 641001",
    line3: "Email: support@brightbridge.org",
  },
  {
    title: "Partner School Contact",
    line1: "Bright Future Special School",
    line2: "Madurai, Tamil Nadu 625001",
    line3: "Phone: +91 91234 56789",
  },
];

const ContactUsPage = () => {
  return (
    <div className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-2 font-display text-3xl font-bold text-foreground"
        >
          Contact Us
        </motion.h1>
        <p className="mb-8 text-muted-foreground">
          Support locations for schools, trusts, and student guidance.
        </p>

        <div className="grid gap-5 md:grid-cols-3">
          {contacts.map((contact, index) => (
            <motion.div
              key={contact.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="glass-card p-6"
            >
              <h2 className="mb-3 font-display text-xl font-bold text-foreground">
                {contact.title}
              </h2>
              <p className="text-sm leading-7 text-muted-foreground">{contact.line1}</p>
              <p className="text-sm leading-7 text-muted-foreground">{contact.line2}</p>
              <p className="mt-2 font-semibold text-foreground">{contact.line3}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContactUsPage;
