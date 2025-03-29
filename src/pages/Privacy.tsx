
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Privacy() {
  return (
    <div className="container max-w-4xl py-8 space-y-8 animate-fade-in">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
            Privacy Policy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-base leading-relaxed">
          <p><strong>Last Updated:</strong> June 1, 2025</p>
          
          <h2 className="text-2xl font-semibold mt-6 mb-2">1. Introduction</h2>
          <p>
            Welcome to ChoreChart. We respect your privacy and are committed to protecting your personal data. 
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
          </p>
          
          <h2 className="text-2xl font-semibold mt-6 mb-2">2. Information We Collect</h2>
          <p>We collect several types of information, including:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Personal information (name, email address, etc.) that you provide when registering</li>
            <li>Profile information and photos you upload to verify completed chores</li>
            <li>Information about your household and chore assignments</li>
            <li>Usage data and analytics to improve our service</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-6 mb-2">3. How We Use Your Information</h2>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>To provide and maintain our service</li>
            <li>To notify you about changes to our service</li>
            <li>To allow you to participate in interactive features</li>
            <li>To provide customer support</li>
            <li>To gather analysis to improve our service</li>
            <li>To monitor usage of our service</li>
            <li>To detect, prevent, and address technical issues</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-6 mb-2">4. Data Storage and Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal data against 
            unauthorized or unlawful processing, accidental loss, destruction, or damage.
          </p>
          
          <h2 className="text-2xl font-semibold mt-6 mb-2">5. Your Data Protection Rights</h2>
          <p>Depending on your location, you may have the following rights:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>The right to access your personal data</li>
            <li>The right to rectification of inaccurate personal data</li>
            <li>The right to erasure of your personal data</li>
            <li>The right to restrict processing of your personal data</li>
            <li>The right to data portability</li>
            <li>The right to object to processing of your personal data</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-6 mb-2">6. Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new 
            Privacy Policy on this page and updating the "Last Updated" date.
          </p>
          
          <h2 className="text-2xl font-semibold mt-6 mb-2">7. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at:
            <br />
            <a href="mailto:privacy@chorechart.com" className="text-purple-600 hover:underline">privacy@chorechart.com</a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
