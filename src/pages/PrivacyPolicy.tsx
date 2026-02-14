export const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background py-12 px-6">
      <div className="max-w-3xl mx-auto space-y-8 pb-20">
        <div>
          <h1 className="text-4xl font-black bg-gradient-primary bg-clip-text text-transparent mb-2">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground">Last updated: February 13, 2026</p>
        </div>

        <div className="space-y-6">
          <section className="space-y-3">
            <h2 className="text-2xl font-bold">1. Introduction</h2>
            <p className="text-foreground/80 leading-relaxed">
              RaiderRash ("we," "us," "our," or "Company") operates the RaiderRash mobile and web application
              (the "Service"). This Privacy Policy explains how we collect, use, disclose, and safeguard your
              information when you visit our application, website, and systems.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold">2. Information We Collect</h2>
            <div className="space-y-2 text-foreground/80 leading-relaxed">
              <p>We collect information you provide directly:</p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li>Account registration data (name, email, age, major)</li>
                <li>Profile information (photos, bio, interests)</li>
                <li>Communication data (messages, reports)</li>
                <li>Device information (type, OS, unique identifiers)</li>
                <li>Usage data (preferences, interactions, timestamps)</li>
              </ul>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold">3. How We Use Your Information</h2>
            <div className="space-y-2 text-foreground/80 leading-relaxed">
              <p>We use your information to:</p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li>Provide and improve the Service</li>
                <li>Facilitate connections and matching</li>
                <li>Send transactional emails and notifications</li>
                <li>Monitor and prevent fraudulent activity</li>
                <li>Comply with legal obligations</li>
                <li>Respond to user requests and support inquiries</li>
              </ul>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold">4. Photo Verification System</h2>
            <p className="text-foreground/80 leading-relaxed">
              We use a photo verification system to ensure user authenticity and safety. Your photos are analyzed
              to confirm you are a real person. Verified profiles are marked with a checkmark and appear more
              frequently in discovery. Photos may be stored securely and reviewed by our moderation team.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold">5. Safety and Reporting</h2>
            <p className="text-foreground/80 leading-relaxed">
              We provide tools to report inappropriate content and users. Reports are reviewed by our moderation
              team and actions may include warnings, profile suspension, or account termination. We take safety
              seriously and encourage you to report any suspicious activity.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold">6. Data Security</h2>
            <p className="text-foreground/80 leading-relaxed">
              We use industry-standard encryption and security measures to protect your data. However, no method
              of transmission is 100% secure. We implement role-based access controls, audit logs, and regular
              security reviews. Your password should never be shared with anyone.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold">7. Third-Party Services</h2>
            <p className="text-foreground/80 leading-relaxed">
              We may use third-party services for email delivery, analytics, and cloud infrastructure. These
              services have their own privacy policies and we encourage you to review them. We do not sell your
              personal information to third parties.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold">8. Data Retention</h2>
            <p className="text-foreground/80 leading-relaxed">
              We retain your information for as long as your account is active or as needed to provide the Service.
              You may request deletion of your account and associated data at any time. Some information may be
              retained for legal or safety reasons.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold">9. Your Rights</h2>
            <div className="space-y-2 text-foreground/80 leading-relaxed">
              <p>You have the right to:</p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li>Access your personal information</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your account</li>
                <li>Opt-out of marketing emails</li>
                <li>Download your data</li>
              </ul>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold">10. Changes to This Policy</h2>
            <p className="text-foreground/80 leading-relaxed">
              We may update this Privacy Policy periodically. We will notify you of significant changes via email
              or through the Service. Your continued use constitutes acceptance of updated terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold">11. Contact Us</h2>
            <p className="text-foreground/80 leading-relaxed">
              For privacy concerns or requests, contact us at:{" "}
              <a href="mailto:privacy@raiderrash.com" className="text-primary font-semibold hover:underline">
                privacy@raiderrash.com
              </a>
            </p>
          </section>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 text-sm text-muted-foreground">
          <p>
            This Privacy Policy applies to all users of RaiderRash. By using our Service, you acknowledge that
            you have read and understood this policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
