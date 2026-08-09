import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageShell } from "@/components/app-layout";
import { Search, Plus, MapPin, Building2, Pencil, Trash2, Droplet, X } from "lucide-react";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/banks")({
  head: () => ({
    meta: [
      { title: "Blood Banks — PulseLink" },
      { name: "description", content: "All blood banks connected to the PulseLink redistribution network." },
    ],
  }),
  component: Banks,
});

type Bank = {
  _id: string;
  name: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  status: string;
  contact: string;
};

type InventoryItem = {
  _id: string;
  bloodBank: { _id: string; name: string; city: string } | string;
  bloodGroup: string;
  component: string;
  units: number;
  expiryDate: string;
  status: string;
};

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const components = ["Whole Blood", "Red Blood Cells", "Platelets", "Plasma"];

const emptyBankForm = { name: "", city: "", address: "", latitude: "", longitude: "", contact: "" };
const emptyBatchForm = { bloodGroup: "O+", component: "Whole Blood", units: "", expiryDate: "" };

function Banks() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [bankFormOpen, setBankFormOpen] = useState(false);
  const [editingBank, setEditingBank] = useState<Bank | null>(null);
  const [bankForm, setBankForm] = useState(emptyBankForm);
  const [detailsBank, setDetailsBank] = useState<Bank | null>(null);
  const [batchFormOpen, setBatchFormOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<InventoryItem | null>(null);
  const [batchForm, setBatchForm] = useState(emptyBatchForm);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["bloodBanks"],
    queryFn: () => apiGet<{ success: boolean; data: Bank[] }>("/api/bloodbanks"),
  });
  const banks = data?.data ?? [];

  const filteredBanks = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return banks;
    return banks.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.city.toLowerCase().includes(q) ||
        b.address.toLowerCase().includes(q)
    );
  }, [banks, search]);

  const invalidateBanks = () => queryClient.invalidateQueries({ queryKey: ["bloodBanks"] });
  const invalidateInventory = () => {
    queryClient.invalidateQueries({ queryKey: ["inventory"] });
    queryClient.invalidateQueries({ queryKey: ["bankInventory", detailsBank?._id] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    queryClient.invalidateQueries({ queryKey: ["analytics"] });
  };

  // ---- Bank mutations ----
  const createBankMutation = useMutation({
    mutationFn: (body: unknown) => apiPost<{ success: boolean; data: Bank }>("/api/bloodbanks", body),
    onSuccess: () => {
      setActionMessage("Blood bank added.");
      invalidateBanks();
      closeBankForm();
    },
    onError: (e: unknown) => setActionMessage(e instanceof Error ? e.message : "Unable to add blood bank."),
  });

  const updateBankMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: unknown }) =>
      apiPut<{ success: boolean; data: Bank }>(`/api/bloodbanks/${id}`, body),
    onSuccess: () => {
      setActionMessage("Blood bank updated.");
      invalidateBanks();
      closeBankForm();
    },
    onError: (e: unknown) => setActionMessage(e instanceof Error ? e.message : "Unable to update blood bank."),
  });

  const deleteBankMutation = useMutation({
    mutationFn: (id: string) => apiDelete<{ success: boolean }>(`/api/bloodbanks/${id}`),
    onSuccess: () => {
      setActionMessage("Blood bank removed.");
      invalidateBanks();
      if (detailsBank) setDetailsBank(null);
    },
    onError: (e: unknown) => setActionMessage(e instanceof Error ? e.message : "Unable to remove blood bank."),
  });

  function openAddBank() {
    setEditingBank(null);
    setBankForm(emptyBankForm);
    setBankFormOpen(true);
  }
  function openEditBank(b: Bank) {
    setEditingBank(b);
    setBankForm({
      name: b.name,
      city: b.city,
      address: b.address,
      latitude: String(b.latitude),
      longitude: String(b.longitude),
      contact: b.contact,
    });
    setBankFormOpen(true);
  }
  function closeBankForm() {
    setBankFormOpen(false);
    setEditingBank(null);
    setBankForm(emptyBankForm);
  }
  function submitBankForm() {
    const body = {
      name: bankForm.name.trim(),
      city: bankForm.city.trim(),
      address: bankForm.address.trim(),
      latitude: Number(bankForm.latitude),
      longitude: Number(bankForm.longitude),
      contact: bankForm.contact.trim(),
    };
    if (!body.name || !body.city || !body.address || !body.contact) {
      setActionMessage("Please fill in all bank fields.");
      return;
    }
    if (Number.isNaN(body.latitude) || Number.isNaN(body.longitude)) {
      setActionMessage("Latitude and longitude must be numbers.");
      return;
    }
    if (editingBank) {
      updateBankMutation.mutate({ id: editingBank._id, body });
    } else {
      createBankMutation.mutate(body);
    }
  }

  // ---- Inventory (batch) query + mutations, scoped to the bank being viewed ----
  const { data: bankInventoryData, isLoading: inventoryLoading } = useQuery({
    queryKey: ["bankInventory", detailsBank?._id],
    queryFn: () =>
      apiGet<{ success: boolean; data: InventoryItem[] }>(`/api/inventory?bloodBank=${detailsBank?._id}`),
    enabled: !!detailsBank,
  });
  const bankInventory = bankInventoryData?.data ?? [];

  const createBatchMutation = useMutation({
    mutationFn: (body: unknown) => apiPost<{ success: boolean; data: InventoryItem }>("/api/inventory", body),
    onSuccess: () => {
      setActionMessage("Batch added.");
      invalidateInventory();
      closeBatchForm();
    },
    onError: (e: unknown) => setActionMessage(e instanceof Error ? e.message : "Unable to add batch."),
  });

  const updateBatchMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: unknown }) =>
      apiPut<{ success: boolean; data: InventoryItem }>(`/api/inventory/${id}`, body),
    onSuccess: () => {
      setActionMessage("Batch updated.");
      invalidateInventory();
      closeBatchForm();
    },
    onError: (e: unknown) => setActionMessage(e instanceof Error ? e.message : "Unable to update batch."),
  });

  const deleteBatchMutation = useMutation({
    mutationFn: (id: string) => apiDelete<{ success: boolean }>(`/api/inventory/${id}`),
    onSuccess: () => {
      setActionMessage("Batch removed.");
      invalidateInventory();
    },
    onError: (e: unknown) => setActionMessage(e instanceof Error ? e.message : "Unable to remove batch."),
  });

  function openAddBatch() {
    setEditingBatch(null);
    setBatchForm(emptyBatchForm);
    setBatchFormOpen(true);
  }
  function openEditBatch(item: InventoryItem) {
    setEditingBatch(item);
    setBatchForm({
      bloodGroup: item.bloodGroup,
      component: item.component,
      units: String(item.units),
      expiryDate: item.expiryDate.slice(0, 10),
    });
    setBatchFormOpen(true);
  }
  function closeBatchForm() {
    setBatchFormOpen(false);
    setEditingBatch(null);
    setBatchForm(emptyBatchForm);
  }
  function submitBatchForm() {
    if (!detailsBank) return;
    const units = Number(batchForm.units);
    if (!batchForm.expiryDate || Number.isNaN(units) || units < 0) {
      setActionMessage("Enter a valid unit count and expiry date.");
      return;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(batchForm.expiryDate) < today) {
      setActionMessage("Expiry date can't be in the past.");
      return;
    }
    const body = {
      bloodBank: detailsBank._id,
      bloodGroup: batchForm.bloodGroup,
      component: batchForm.component,
      units,
      expiryDate: batchForm.expiryDate,
    };
    if (editingBatch) {
      updateBatchMutation.mutate({ id: editingBatch._id, body });
    } else {
      createBatchMutation.mutate(body);
    }
  }

  const busy =
    createBankMutation.isPending ||
    updateBankMutation.isPending ||
    deleteBankMutation.isPending ||
    createBatchMutation.isPending ||
    updateBatchMutation.isPending ||
    deleteBatchMutation.isPending;

  return (
    <PageShell
      title="Blood Banks"
      subtitle="Manage the blood banks connected to the PulseLink network. Banks and stock added here immediately factor into the next recommendation and forecast run."
      actions={
        <button
          onClick={openAddBank}
          className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3.5 text-[13px] font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Add Blood Bank
        </button>
      }
    >
      {actionMessage ? (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground">
          {actionMessage}
          <button onClick={() => setActionMessage(null)} className="text-muted-foreground hover:text-foreground">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : null}

      <div className="flex h-10 items-center gap-2 rounded-md border border-border bg-card px-3">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search blood banks by name, city, address…"
          className="h-full flex-1 bg-transparent text-[13px] outline-none"
        />
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">Loading blood banks…</div>
      ) : isError ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-red-600">Unable to load blood banks.</div>
      ) : filteredBanks.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">No blood banks match your search.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredBanks.map((b) => {
            const tone =
              b.status === "active"
                ? "bg-success/10 text-success"
                : "bg-warning/15 text-warning-foreground";
            return (
              <div key={b._id} className="group rounded-xl border border-border bg-card p-5 transition hover:border-foreground/20">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <span className={`inline-flex h-5 items-center rounded-full px-2 text-[11px] font-semibold ${tone}`}>{b.status === "active" ? "Operational" : "Inactive"}</span>
                </div>
                <div className="mt-4 text-[15px] font-semibold text-foreground">{b.name}</div>
                <div className="mt-0.5 inline-flex items-center gap-1 text-[12.5px] text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {b.city}
                </div>

                <div className="mt-4 rounded-lg bg-surface p-3">
                  <div className="text-[12px] text-muted-foreground">Contact</div>
                  <div className="mt-2 text-[13px] font-semibold text-foreground">{b.contact}</div>
                  <div className="mt-3 text-[12px] text-muted-foreground">{b.address}</div>
                </div>

                <div className="mt-5 flex gap-2">
                  <button
                    onClick={() => setDetailsBank(b)}
                    className="h-9 flex-1 rounded-md border border-border text-[13px] font-medium hover:bg-surface"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => openEditBank(b)}
                    className="flex h-9 w-9 items-center justify-center rounded-md border border-border hover:bg-surface"
                    title="Edit"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Remove ${b.name}? This cannot be undone.`)) deleteBankMutation.mutate(b._id);
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-red-600 hover:bg-red-50"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / edit bank dialog */}
      <Dialog open={bankFormOpen} onOpenChange={(open) => (open ? setBankFormOpen(true) : closeBankForm())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBank ? "Edit Blood Bank" : "Add Blood Bank"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <Field label="Name">
              <Input value={bankForm.name} onChange={(e) => setBankForm({ ...bankForm, name: e.target.value })} />
            </Field>
            <Field label="City">
              <Input value={bankForm.city} onChange={(e) => setBankForm({ ...bankForm, city: e.target.value })} />
            </Field>
            <Field label="Address">
              <Input value={bankForm.address} onChange={(e) => setBankForm({ ...bankForm, address: e.target.value })} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Latitude">
                <Input
                  type="number"
                  value={bankForm.latitude}
                  onChange={(e) => setBankForm({ ...bankForm, latitude: e.target.value })}
                />
              </Field>
              <Field label="Longitude">
                <Input
                  type="number"
                  value={bankForm.longitude}
                  onChange={(e) => setBankForm({ ...bankForm, longitude: e.target.value })}
                />
              </Field>
            </div>
            <Field label="Contact">
              <Input value={bankForm.contact} onChange={(e) => setBankForm({ ...bankForm, contact: e.target.value })} />
            </Field>
          </div>
          <button
            onClick={submitBankForm}
            disabled={busy}
            className="h-9 w-full rounded-md bg-primary text-[13px] font-medium text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-60"
          >
            {editingBank ? "Save Changes" : "Add Blood Bank"}
          </button>
        </DialogContent>
      </Dialog>

      {/* Bank details dialog: inventory batch management */}
      <Dialog open={!!detailsBank} onOpenChange={(open) => !open && setDetailsBank(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{detailsBank?.name}</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-between">
            <div className="text-[12.5px] text-muted-foreground">{detailsBank?.city} · {detailsBank?.address}</div>
            <button
              onClick={openAddBatch}
              className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-[12.5px] font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-3.5 w-3.5" /> Add Batch
            </button>
          </div>

          <div className="mt-3 max-h-80 overflow-y-auto rounded-lg border border-border">
            {inventoryLoading ? (
              <div className="p-6 text-center text-[13px] text-muted-foreground">Loading inventory…</div>
            ) : bankInventory.length === 0 ? (
              <div className="p-6 text-center text-[13px] text-muted-foreground">No batches yet for this bank.</div>
            ) : (
              <div className="divide-y divide-border">
                {bankInventory.map((item) => (
                  <div key={item._id} className="flex items-center gap-3 px-4 py-3">
                    <Droplet className="h-4 w-4 shrink-0 text-primary" />
                    <div className="flex-1">
                      <div className="text-[13px] font-semibold text-foreground">
                        {item.bloodGroup} · {item.component}
                      </div>
                      <div className="text-[11.5px] text-muted-foreground">
                        {item.units} units · expires {new Date(item.expiryDate).toLocaleDateString()} · {item.status}
                      </div>
                    </div>
                    <button
                      onClick={() => openEditBatch(item)}
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-border hover:bg-surface"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("Remove this batch?")) deleteBatchMutation.mutate(item._id);
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add / edit batch dialog */}
      <Dialog open={batchFormOpen} onOpenChange={(open) => (open ? setBatchFormOpen(true) : closeBatchForm())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBatch ? "Edit Batch" : "Add Batch"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Blood Group">
                <select
                  value={batchForm.bloodGroup}
                  onChange={(e) => setBatchForm({ ...batchForm, bloodGroup: e.target.value })}
                  className="h-9 w-full rounded-md border border-border bg-background px-2.5 text-[13px] outline-none"
                >
                  {bloodGroups.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </Field>
              <Field label="Component">
                <select
                  value={batchForm.component}
                  onChange={(e) => setBatchForm({ ...batchForm, component: e.target.value })}
                  className="h-9 w-full rounded-md border border-border bg-background px-2.5 text-[13px] outline-none"
                >
                  {components.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Units">
              <Input
                type="number"
                min={0}
                value={batchForm.units}
                onChange={(e) => setBatchForm({ ...batchForm, units: e.target.value })}
              />
            </Field>
            <Field label="Expiry Date">
              <Input
                type="date"
                value={batchForm.expiryDate}
                onChange={(e) => setBatchForm({ ...batchForm, expiryDate: e.target.value })}
              />
            </Field>
          </div>
          <button
            onClick={submitBatchForm}
            disabled={busy}
            className="h-9 w-full rounded-md bg-primary text-[13px] font-medium text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-60"
          >
            {editingBatch ? "Save Changes" : "Add Batch"}
          </button>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-[12px] text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
