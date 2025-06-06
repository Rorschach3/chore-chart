
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function About() {
  return (
    <div className="container max-w-4xl py-8 space-y-8 animate-fade-in">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
            About ChoreChart
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-lg leading-relaxed">
          <p>
            ChoreChart is a modern solution designed to help roommates manage and distribute household chores fairly and efficiently. Our automated system takes the hassle out of chore management, making shared living spaces more harmonious.
          </p>
          <p>
            Whether you're living with one roommate or several, ChoreChart helps you:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Automatically distribute chores fairly among household members</li>
            <li>Track completion of tasks with photo verification</li>
            <li>Maintain a clear schedule of responsibilities</li>
            <li>Avoid conflicts over household duties</li>
            <li>Keep your shared space clean and organized</li>
          </ul>
          <p>
            Our mission is to make shared living spaces more organized, peaceful, and enjoyable for everyone involved.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
