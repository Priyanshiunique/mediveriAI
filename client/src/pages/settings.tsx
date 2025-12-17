import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/theme-provider";
import {
  Settings as SettingsIcon,
  Moon,
  Sun,
  Bell,
  Shield,
  Database,
  Zap,
  CheckCircle2,
} from "lucide-react";

export default function Settings() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Configure application preferences and agent settings
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-card-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              {theme === "dark" ? (
                <Moon className="w-5 h-5 text-primary" />
              ) : (
                <Sun className="w-5 h-5 text-primary" />
              )}
              Appearance
            </CardTitle>
            <CardDescription>Customize how the application looks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode" className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-muted-foreground" />
                Dark Mode
              </Label>
              <Switch
                id="dark-mode"
                checked={theme === "dark"}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                data-testid="switch-dark-mode"
              />
            </div>
            <Separator />
            <div className="flex flex-wrap gap-2">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("light")}
                data-testid="button-theme-light"
              >
                <Sun className="w-4 h-4 mr-2" />
                Light
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("dark")}
                data-testid="button-theme-dark"
              >
                <Moon className="w-4 h-4 mr-2" />
                Dark
              </Button>
              <Button
                variant={theme === "system" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("system")}
                data-testid="button-theme-system"
              >
                <SettingsIcon className="w-4 h-4 mr-2" />
                System
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-card-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bell className="w-5 h-5 text-primary" />
              Notifications
            </CardTitle>
            <CardDescription>Configure alert preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="validation-alerts">Validation Complete Alerts</Label>
              <Switch id="validation-alerts" defaultChecked data-testid="switch-validation-alerts" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="flagged-alerts">Flagged Provider Alerts</Label>
              <Switch id="flagged-alerts" defaultChecked data-testid="switch-flagged-alerts" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="error-alerts">Error Notifications</Label>
              <Switch id="error-alerts" defaultChecked data-testid="switch-error-alerts" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-card-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="w-5 h-5 text-primary" />
              AI Agents
            </CardTitle>
            <CardDescription>Configure validation agent behavior</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="confidence-threshold">Confidence Threshold (%)</Label>
              <Input
                id="confidence-threshold"
                type="number"
                defaultValue={70}
                min={0}
                max={100}
                data-testid="input-confidence-threshold"
              />
              <p className="text-xs text-muted-foreground">
                Providers below this threshold will be flagged for review
              </p>
            </div>
            <Separator />
            <div className="space-y-3">
              <Label>Active Agents</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-chart-2" />
                    <span className="text-sm font-medium">Data Validation Agent</span>
                  </div>
                  <Badge className="bg-chart-2/10 text-chart-2 border-chart-2/20">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-chart-2" />
                    <span className="text-sm font-medium">Information Enrichment Agent</span>
                  </div>
                  <Badge className="bg-chart-2/10 text-chart-2 border-chart-2/20">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-chart-2" />
                    <span className="text-sm font-medium">Quality Assurance Agent</span>
                  </div>
                  <Badge className="bg-chart-2/10 text-chart-2 border-chart-2/20">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-chart-2" />
                    <span className="text-sm font-medium">Directory Management Agent</span>
                  </div>
                  <Badge className="bg-chart-2/10 text-chart-2 border-chart-2/20">Active</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-card-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="w-5 h-5 text-primary" />
              Data Sources
            </CardTitle>
            <CardDescription>External validation sources</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
              <div>
                <p className="text-sm font-medium">NPI Registry API</p>
                <p className="text-xs text-muted-foreground">NPPES National Provider Identifier</p>
              </div>
              <Badge className="bg-chart-2/10 text-chart-2 border-chart-2/20">Connected</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
              <div>
                <p className="text-sm font-medium">Address Verification</p>
                <p className="text-xs text-muted-foreground">USPS Address Validation</p>
              </div>
              <Badge className="bg-chart-3/10 text-chart-3 border-chart-3/20">Mock</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
              <div>
                <p className="text-sm font-medium">Phone Verification</p>
                <p className="text-xs text-muted-foreground">Format and carrier validation</p>
              </div>
              <Badge className="bg-chart-3/10 text-chart-3 border-chart-3/20">Mock</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-card-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Database className="w-5 h-5 text-primary" />
            System Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="p-4 rounded-md bg-muted/50">
              <p className="text-sm text-muted-foreground">Version</p>
              <p className="font-medium">1.0.0</p>
            </div>
            <div className="p-4 rounded-md bg-muted/50">
              <p className="text-sm text-muted-foreground">Environment</p>
              <p className="font-medium">Development</p>
            </div>
            <div className="p-4 rounded-md bg-muted/50">
              <p className="text-sm text-muted-foreground">Storage</p>
              <p className="font-medium">In-Memory</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
