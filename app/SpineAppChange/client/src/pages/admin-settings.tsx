import { ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { GoogleSheetsSetup } from "../components/ui/google-sheets-setup";
import { useLocation } from "wouter";

export default function AdminSettings() {
  const [, setLocation] = useLocation();

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="medical-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">Admin Settings</CardTitle>
            <Button
              variant="ghost"
              onClick={() => setLocation("/")}
              className="text-primary hover:bg-blue-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <GoogleSheetsSetup />
        </CardContent>
      </Card>
    </main>
  );
}
