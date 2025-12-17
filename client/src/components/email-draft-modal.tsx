import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Send, Copy, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Provider, EmailDraft } from "@shared/schema";

interface EmailDraftModalProps {
  provider: Provider | null;
  draft: EmailDraft | null;
  isOpen: boolean;
  onClose: () => void;
  onSend: (draft: { subject: string; body: string; recipientEmail: string }) => void;
  isLoading?: boolean;
}

export function EmailDraftModal({
  provider,
  draft,
  isOpen,
  onClose,
  onSend,
  isLoading,
}: EmailDraftModalProps) {
  const { toast } = useToast();
  const [subject, setSubject] = useState(draft?.subject || "");
  const [body, setBody] = useState(draft?.body || "");
  const [recipientEmail, setRecipientEmail] = useState(draft?.recipientEmail || provider?.email || "");
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const fullEmail = `To: ${recipientEmail}\nSubject: ${subject}\n\n${body}`;
    await navigator.clipboard.writeText(fullEmail);
    setCopied(true);
    toast({
      title: "Copied to clipboard",
      description: "Email content has been copied",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = () => {
    if (!recipientEmail) {
      toast({
        title: "Email required",
        description: "Please enter a recipient email address",
        variant: "destructive",
      });
      return;
    }
    onSend({ subject, body, recipientEmail });
  };

  if (!provider) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            Email Draft for {provider.firstName} {provider.lastName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Card className="border-card-border bg-muted/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="outline" className="font-mono">
                  NPI: {provider.npi}
                </Badge>
                {provider.specialty && (
                  <Badge variant="outline">{provider.specialty}</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient Email</Label>
            <Input
              id="recipient"
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="provider@example.com"
              data-testid="input-email-recipient"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject"
              data-testid="input-email-subject"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Message</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Enter email message"
              className="min-h-[200px] resize-none"
              data-testid="input-email-body"
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} data-testid="button-cancel-email">
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={handleCopy}
            data-testid="button-copy-email"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy to Clipboard
              </>
            )}
          </Button>
          <Button onClick={handleSend} disabled={isLoading} data-testid="button-send-email">
            <Send className="w-4 h-4 mr-2" />
            {isLoading ? "Sending..." : "Send Email"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
