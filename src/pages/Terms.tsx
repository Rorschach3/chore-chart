
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Terms() {
  return (
    <div className="container max-w-4xl py-8 space-y-8 animate-fade-in">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
            Terms and Conditions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-base leading-relaxed">
          <p><strong>Last Updated:</strong> June 1, 2025</p>
          
          <h2 className="text-2xl font-semibold mt-6 mb-2">1. Agreement to Terms</h2>
          <p>
            By accessing or using ChoreChart, you agree to be bound by these Terms and Conditions and our Privacy Policy. 
            If you disagree with any part of the terms, you may not access the service.
          </p>
          
          <h2 className="text-2xl font-semibold mt-6 mb-2">2. Description of Service</h2>
          <p>
            ChoreChart is a household management application that allows users to create households, assign and track chores, 
            and verify their completion. We reserve the right to modify or discontinue, temporarily or permanently, the service 
            with or without notice.
          </p>
          
          <h2 className="text-2xl font-semibold mt-6 mb-2">3. User Accounts</h2>
          <p>
            When you create an account with us, you must provide accurate, complete, and current information. You are responsible 
            for safeguarding the password and for all activities that occur under your account. You agree to notify us immediately 
            of any unauthorized use of your account.
          </p>
          
          <h2 className="text-2xl font-semibold mt-6 mb-2">4. User Content</h2>
          <p>
            Our service allows you to post, upload, and share content, including photos of completed chores. You retain any rights 
            to content you submit, but grant us a license to use, modify, publicly perform, publicly display, reproduce, and distribute 
            such content on and through the service.
          </p>
          
          <h2 className="text-2xl font-semibold mt-6 mb-2">5. Acceptable Use</h2>
          <p>
            You agree not to use the service to:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Violate any laws or regulations</li>
            <li>Upload or transmit viruses or malicious code</li>
            <li>Impersonate any person or entity</li>
            <li>Interfere with or disrupt the service or servers</li>
            <li>Collect or track personal information of other users</li>
            <li>Spam, phish, or engage in any deceptive practices</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-6 mb-2">6. Intellectual Property</h2>
          <p>
            The service and its original content, features, and functionality are and will remain the exclusive property of 
            ChoreChart and its licensors. The service is protected by copyright, trademark, and other laws.
          </p>
          
          <h2 className="text-2xl font-semibold mt-6 mb-2">7. Termination</h2>
          <p>
            We may terminate or suspend your account immediately, without prior notice or liability, for any reason, including 
            without limitation if you breach the Terms. Upon termination, your right to use the service will immediately cease.
          </p>
          
          <h2 className="text-2xl font-semibold mt-6 mb-2">8. Limitation of Liability</h2>
          <p>
            In no event shall ChoreChart, its directors, employees, partners, agents, suppliers, or affiliates be liable for any 
            indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, 
            use, goodwill, or other intangible losses.
          </p>
          
          <h2 className="text-2xl font-semibold mt-6 mb-2">9. Changes to Terms</h2>
          <p>
            We reserve the right to modify or replace these Terms at any time. If a revision is material, we will try to provide 
            at least 30 days' notice prior to any new terms taking effect.
          </p>
          
          <h2 className="text-2xl font-semibold mt-6 mb-2">10. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at:
            <br />
            <a href="mailto:terms@chorechart.com" className="text-purple-600 hover:underline">terms@chorechart.com</a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
