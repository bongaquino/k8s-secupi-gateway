import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Key, Plus, Copy, Check, Info, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  useApiKeys,
  useCreateApiKey,
  useRevokeApiKey,
} from "../../hooks/useApiKeys";

const ApiKeys = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [isRevokeDialogOpen, setIsRevokeDialogOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [copiedField, setCopiedField] = useState("");

  const [createdApiKey, setCreatedApiKey] = useState<{
    client_id: string;
    client_secret: string;
  } | null>(null);

  const [keyToRevoke, setKeyToRevoke] = useState<{
    client_id: string;
    name: string;
  } | null>(null);

  const { data: apiKeysResponse, isLoading, error, refetch } = useApiKeys();
  const { mutate: createApiKey, isPending: isCreating } = useCreateApiKey();
  const { mutate: revokeApiKey, isPending: isRevoking } = useRevokeApiKey();

  const apiKeys = apiKeysResponse?.data || [];

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setCopiedField(fieldId);
    setTimeout(() => {
      setIsCopied(false);
      setCopiedField("");
    }, 2000);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return dateString;
    }
  };

  const handleCreateKey = () => {
    if (!newKeyName.trim()) {
      toast.error("Please enter a key name");
      return;
    }

    createApiKey(
      { name: newKeyName.trim() },
      {
        onSuccess: (response) => {
          if (response.status === "success") {
            setCreatedApiKey({
              client_id: response.data.client_id,
              client_secret: response.data.client_secret,
            });
            setNewKeyName("");
            setIsCreateDialogOpen(false);
            setIsSuccessDialogOpen(true);
            toast.success("API key created successfully!");
            refetch();
          } else {
            toast.error(response.message || "Failed to create API key");
          }
        },
        onError: (error: any) => {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Failed to create API key";
          toast.error(errorMessage);
        },
      }
    );
  };

  const handleRevokeKey = () => {
    if (!keyToRevoke) return;

    revokeApiKey(
      { client_id: keyToRevoke.client_id },
      {
        onSuccess: (response) => {
          if (response.status === "success") {
            toast.success(`API key "${keyToRevoke.name}" revoked successfully`);
            setIsRevokeDialogOpen(false);
            setKeyToRevoke(null);
            refetch();
          } else {
            toast.error(response.message || "Failed to revoke API key");
          }
        },
        onError: (error: any) => {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Failed to revoke API key";
          toast.error(errorMessage);
        },
      }
    );
  };

  const openRevokeDialog = (clientId: string, name: string) => {
    setKeyToRevoke({ client_id: clientId, name });
    setIsRevokeDialogOpen(true);
  };

  // Utility function to truncate Client ID
  const truncateClientId = (clientId: string, maxLength: number = 20) => {
    if (clientId.length <= maxLength) return clientId;

    const startChars = Math.floor((maxLength - 3) / 2); // Reserve 3 chars for "..."
    const endChars = maxLength - 3 - startChars;

    return `${clientId.substring(0, startChars)}...${clientId.substring(
      clientId.length - endChars
    )}`;
  };

  if (error) {
    return (
      <div className="container mx-auto pb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">
            API Keys
          </h1>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4" /> New API Key
          </Button>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p>Failed to load API keys. Please try again.</p>
          <Button variant="outline" onClick={() => refetch()} className="mt-2">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto pb-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">
          API Keys
        </h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4" /> New API Key
        </Button>
      </div>

      <div className="bg-white rounded-xl border max-h-fit">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[22%]">
                <div className="ml-2">Key Name</div>
              </TableHead>
              <TableHead className="w-[20%]">Client ID</TableHead>
              <TableHead className="w-[18%]">Date Created</TableHead>
              <TableHead className="w-[10%]">Last Used</TableHead>
              <TableHead className="w-[10%] text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-12 text-gray-400"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
                    <span className="text-base">Loading API keys...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : apiKeys.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-12 text-gray-400"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Key className="h-8 w-8 text-gray-200 mb-2" />
                    <span className="text-base">No API keys created yet.</span>
                    <span className="text-sm text-gray-400">
                      Click <b>New API Key</b> to create your first key.
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              apiKeys.map((apiKey) => (
                <TableRow key={apiKey.ID}>
                  <TableCell className="font-medium">
                    <div className="flex items-center ml-2">
                      <Key className="h-4 w-4 mr-2 text-blue-500" />
                      {apiKey.Name}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">
                    <div className="flex items-center gap-2">
                      <span title={apiKey.ClientID}>
                        {truncateClientId(apiKey.ClientID)}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6 p-1"
                        onClick={() =>
                          copyToClipboard(apiKey.ClientID, apiKey.ID)
                        }
                      >
                        {isCopied && copiedField === apiKey.ID ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(apiKey.CreatedAt)}</TableCell>
                  <TableCell>
                    {apiKey.LastUsedAt
                      ? formatDate(apiKey.LastUsedAt)
                      : "Never"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        openRevokeDialog(apiKey.ClientID, apiKey.Name)
                      }
                      className="text-red-500 hover:text-red-600 hover:border-red-200 mr-2"
                    >
                      Revoke
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New API Key</DialogTitle>
            <DialogDescription>
              Create a new API key to access bongaquino services
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="keyName">Key Name</Label>
              <Input
                id="keyName"
                placeholder="Name of your API Key"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                disabled={isCreating}
              />
            </div>
            <div className="grid gap-2 mt-2">
              <Label>Permissions</Label>
              <div className="flex bg-gray-100 rounded-md p-1 gap-1">
                <div className="flex-1 h-8 flex items-center justify-center text-sm rounded-md bg-black text-white">
                  All
                </div>
                <div className="flex-1 h-8 flex items-center justify-center text-sm rounded-md text-gray-400 bg-gray-100 cursor-not-allowed">
                  Custom
                </div>
                <div className="flex-1 h-8 flex items-center justify-center text-sm rounded-md text-gray-400 bg-gray-100 cursor-not-allowed">
                  Read Only
                </div>
              </div>
              <div className="bg-blue-50 p-3 rounded-md text-blue-700 text-sm mt-2">
                <div className="flex items-start">
                  <Info className="h-4 w-4 mr-2 mt-0.5" />
                  <span>Allow full access to all user endpoints.</span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                disabled={isCreating}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateKey}
                disabled={isCreating}
                className="flex-1"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Key"
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Save your key</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div>
              <p className="mb-2">
                Please save your secret key in a safe place since{" "}
                <strong>you won't be able to view it again</strong>.
              </p>
              <p>
                Keep it secure, as anyone with your API key can make requests on
                your behalf. If you do lose it, you'll need to generate a new
                one.
              </p>
            </div>
            {createdApiKey && (
              <>
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-md border border-gray-200 mt-2 max-w-full">
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="text-xs text-muted-foreground mb-1">
                      Client ID
                    </div>
                    <div className="font-mono text-sm break-all">
                      {createdApiKey.client_id}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(
                        createdApiKey.client_id,
                        "success-client-id"
                      )
                    }
                    className="ml-2 shrink-0"
                  >
                    {isCopied && copiedField === "success-client-id" ? (
                      <Check className="h-4 w-4 mr-1" />
                    ) : (
                      <Copy className="h-4 w-4 mr-1" />
                    )}
                    {isCopied && copiedField === "success-client-id"
                      ? "Copied"
                      : "Copy"}
                  </Button>
                </div>
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-md border border-gray-200 max-w-full">
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="text-xs text-muted-foreground mb-1">
                      Client Secret
                    </div>
                    <div className="font-mono text-sm break-all">
                      {createdApiKey.client_secret}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(
                        createdApiKey.client_secret,
                        "success-client-secret"
                      )
                    }
                    className="ml-2 shrink-0"
                  >
                    {isCopied && copiedField === "success-client-secret" ? (
                      <Check className="h-4 w-4 mr-1" />
                    ) : (
                      <Copy className="h-4 w-4 mr-1" />
                    )}
                    {isCopied && copiedField === "success-client-secret"
                      ? "Copied"
                      : "Copy"}
                  </Button>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setIsSuccessDialogOpen(false);
                setCreatedApiKey(null);
              }}
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isRevokeDialogOpen} onOpenChange={setIsRevokeDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Revoke API Key</DialogTitle>
          </DialogHeader>
          <div>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to revoke the API key "{keyToRevoke?.name}"?
              Revoking this key will immediately invalidate it. <br />
              <br />
              This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setIsRevokeDialogOpen(false);
                  setKeyToRevoke(null);
                }}
                disabled={isRevoking}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleRevokeKey}
                disabled={isRevoking}
                className="flex-1"
              >
                {isRevoking ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Revoking...
                  </>
                ) : (
                  "Revoke Key"
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApiKeys;
