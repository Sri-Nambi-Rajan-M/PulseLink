import { i as __toESM } from "../_runtime.mjs";
import { i as apiGet, o as apiPost, r as apiDelete, s as apiPut } from "./api-DTZYjuPk.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { I as Building2, _ as Plus, c as Trash2, h as Search, k as Droplet, t as X, x as MapPin, y as Pencil } from "../_libs/lucide-react.mjs";
import { n as PageShell } from "./app-layout-BIvV6DWg.mjs";
import { n as Label, t as Input } from "./label-nLUZFr79.mjs";
import { a as DialogTitle, i as DialogHeader, n as DialogContent, t as Dialog } from "./dialog-naZYOZnZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/banks-DV3dFL3s.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var bloodGroups = [
	"A+",
	"A-",
	"B+",
	"B-",
	"AB+",
	"AB-",
	"O+",
	"O-"
];
var components = [
	"Whole Blood",
	"Red Blood Cells",
	"Platelets",
	"Plasma"
];
var emptyBankForm = {
	name: "",
	city: "",
	address: "",
	latitude: "",
	longitude: "",
	contact: ""
};
var emptyBatchForm = {
	bloodGroup: "O+",
	component: "Whole Blood",
	units: "",
	expiryDate: ""
};
function Banks() {
	const queryClient = useQueryClient();
	const [search, setSearch] = (0, import_react.useState)("");
	const [bankFormOpen, setBankFormOpen] = (0, import_react.useState)(false);
	const [editingBank, setEditingBank] = (0, import_react.useState)(null);
	const [bankForm, setBankForm] = (0, import_react.useState)(emptyBankForm);
	const [detailsBank, setDetailsBank] = (0, import_react.useState)(null);
	const [batchFormOpen, setBatchFormOpen] = (0, import_react.useState)(false);
	const [editingBatch, setEditingBatch] = (0, import_react.useState)(null);
	const [batchForm, setBatchForm] = (0, import_react.useState)(emptyBatchForm);
	const [actionMessage, setActionMessage] = (0, import_react.useState)(null);
	const { data, isLoading, isError } = useQuery({
		queryKey: ["bloodBanks"],
		queryFn: () => apiGet("/api/bloodbanks")
	});
	const banks = data?.data ?? [];
	const filteredBanks = (0, import_react.useMemo)(() => {
		const q = search.trim().toLowerCase();
		if (!q) return banks;
		return banks.filter((b) => b.name.toLowerCase().includes(q) || b.city.toLowerCase().includes(q) || b.address.toLowerCase().includes(q));
	}, [banks, search]);
	const invalidateBanks = () => queryClient.invalidateQueries({ queryKey: ["bloodBanks"] });
	const invalidateInventory = () => {
		queryClient.invalidateQueries({ queryKey: ["inventory"] });
		queryClient.invalidateQueries({ queryKey: ["bankInventory", detailsBank?._id] });
		queryClient.invalidateQueries({ queryKey: ["dashboard"] });
		queryClient.invalidateQueries({ queryKey: ["analytics"] });
	};
	const createBankMutation = useMutation({
		mutationFn: (body) => apiPost("/api/bloodbanks", body),
		onSuccess: () => {
			setActionMessage("Blood bank added.");
			invalidateBanks();
			closeBankForm();
		},
		onError: (e) => setActionMessage(e instanceof Error ? e.message : "Unable to add blood bank.")
	});
	const updateBankMutation = useMutation({
		mutationFn: ({ id, body }) => apiPut(`/api/bloodbanks/${id}`, body),
		onSuccess: () => {
			setActionMessage("Blood bank updated.");
			invalidateBanks();
			closeBankForm();
		},
		onError: (e) => setActionMessage(e instanceof Error ? e.message : "Unable to update blood bank.")
	});
	const deleteBankMutation = useMutation({
		mutationFn: (id) => apiDelete(`/api/bloodbanks/${id}`),
		onSuccess: () => {
			setActionMessage("Blood bank removed.");
			invalidateBanks();
			if (detailsBank) setDetailsBank(null);
		},
		onError: (e) => setActionMessage(e instanceof Error ? e.message : "Unable to remove blood bank.")
	});
	function openAddBank() {
		setEditingBank(null);
		setBankForm(emptyBankForm);
		setBankFormOpen(true);
	}
	function openEditBank(b) {
		setEditingBank(b);
		setBankForm({
			name: b.name,
			city: b.city,
			address: b.address,
			latitude: String(b.latitude),
			longitude: String(b.longitude),
			contact: b.contact
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
			contact: bankForm.contact.trim()
		};
		if (!body.name || !body.city || !body.address || !body.contact) {
			setActionMessage("Please fill in all bank fields.");
			return;
		}
		if (Number.isNaN(body.latitude) || Number.isNaN(body.longitude)) {
			setActionMessage("Latitude and longitude must be numbers.");
			return;
		}
		if (editingBank) updateBankMutation.mutate({
			id: editingBank._id,
			body
		});
		else createBankMutation.mutate(body);
	}
	const { data: bankInventoryData, isLoading: inventoryLoading } = useQuery({
		queryKey: ["bankInventory", detailsBank?._id],
		queryFn: () => apiGet(`/api/inventory?bloodBank=${detailsBank?._id}`),
		enabled: !!detailsBank
	});
	const bankInventory = bankInventoryData?.data ?? [];
	const createBatchMutation = useMutation({
		mutationFn: (body) => apiPost("/api/inventory", body),
		onSuccess: () => {
			setActionMessage("Batch added.");
			invalidateInventory();
			closeBatchForm();
		},
		onError: (e) => setActionMessage(e instanceof Error ? e.message : "Unable to add batch.")
	});
	const updateBatchMutation = useMutation({
		mutationFn: ({ id, body }) => apiPut(`/api/inventory/${id}`, body),
		onSuccess: () => {
			setActionMessage("Batch updated.");
			invalidateInventory();
			closeBatchForm();
		},
		onError: (e) => setActionMessage(e instanceof Error ? e.message : "Unable to update batch.")
	});
	const deleteBatchMutation = useMutation({
		mutationFn: (id) => apiDelete(`/api/inventory/${id}`),
		onSuccess: () => {
			setActionMessage("Batch removed.");
			invalidateInventory();
		},
		onError: (e) => setActionMessage(e instanceof Error ? e.message : "Unable to remove batch.")
	});
	function openAddBatch() {
		setEditingBatch(null);
		setBatchForm(emptyBatchForm);
		setBatchFormOpen(true);
	}
	function openEditBatch(item) {
		setEditingBatch(item);
		setBatchForm({
			bloodGroup: item.bloodGroup,
			component: item.component,
			units: String(item.units),
			expiryDate: item.expiryDate.slice(0, 10)
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
		const today = /* @__PURE__ */ new Date();
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
			expiryDate: batchForm.expiryDate
		};
		if (editingBatch) updateBatchMutation.mutate({
			id: editingBatch._id,
			body
		});
		else createBatchMutation.mutate(body);
	}
	const busy = createBankMutation.isPending || updateBankMutation.isPending || deleteBankMutation.isPending || createBatchMutation.isPending || updateBatchMutation.isPending || deleteBatchMutation.isPending;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageShell, {
		title: "Blood Banks",
		subtitle: "Manage the blood banks connected to the PulseLink network. Banks and stock added here immediately factor into the next recommendation and forecast run.",
		actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			onClick: openAddBank,
			className: "inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3.5 text-[13px] font-medium text-primary-foreground shadow-sm hover:bg-primary/90",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Add Blood Bank"]
		}),
		children: [
			actionMessage ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground",
				children: [actionMessage, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => setActionMessage(null),
					className: "text-muted-foreground hover:text-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3.5 w-3.5" })
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex h-10 items-center gap-2 rounded-md border border-border bg-card px-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: search,
					onChange: (e) => setSearch(e.target.value),
					placeholder: "Search blood banks by name, city, address…",
					className: "h-full flex-1 bg-transparent text-[13px] outline-none"
				})]
			}),
			isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-xl border border-border bg-card p-8 text-center text-muted-foreground",
				children: "Loading blood banks…"
			}) : isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-xl border border-border bg-card p-8 text-center text-red-600",
				children: "Unable to load blood banks."
			}) : filteredBanks.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-xl border border-border bg-card p-8 text-center text-muted-foreground",
				children: "No blood banks match your search."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3",
				children: filteredBanks.map((b) => {
					const tone = b.status === "active" ? "bg-success/10 text-success" : "bg-warning/15 text-warning-foreground";
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "group rounded-xl border border-border bg-card p-5 transition hover:border-foreground/20",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-5 w-5" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: `inline-flex h-5 items-center rounded-full px-2 text-[11px] font-semibold ${tone}`,
									children: b.status === "active" ? "Operational" : "Inactive"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-4 text-[15px] font-semibold text-foreground",
								children: b.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-0.5 inline-flex items-center gap-1 text-[12.5px] text-muted-foreground",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-3 w-3" }),
									" ",
									b.city
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 rounded-lg bg-surface p-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[12px] text-muted-foreground",
										children: "Contact"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-2 text-[13px] font-semibold text-foreground",
										children: b.contact
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-3 text-[12px] text-muted-foreground",
										children: b.address
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-5 flex gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => setDetailsBank(b),
										className: "h-9 flex-1 rounded-md border border-border text-[13px] font-medium hover:bg-surface",
										children: "View Details"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => openEditBank(b),
										className: "flex h-9 w-9 items-center justify-center rounded-md border border-border hover:bg-surface",
										title: "Edit",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-3.5 w-3.5" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => {
											if (confirm(`Remove ${b.name}? This cannot be undone.`)) deleteBankMutation.mutate(b._id);
										},
										className: "flex h-9 w-9 items-center justify-center rounded-md border border-border text-red-600 hover:bg-red-50",
										title: "Delete",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
									})
								]
							})
						]
					}, b._id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: bankFormOpen,
				onOpenChange: (open) => open ? setBankFormOpen(true) : closeBankForm(),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: editingBank ? "Edit Blood Bank" : "Add Blood Bank" }) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3 py-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Name",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: bankForm.name,
									onChange: (e) => setBankForm({
										...bankForm,
										name: e.target.value
									})
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "City",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: bankForm.city,
									onChange: (e) => setBankForm({
										...bankForm,
										city: e.target.value
									})
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Address",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: bankForm.address,
									onChange: (e) => setBankForm({
										...bankForm,
										address: e.target.value
									})
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Latitude",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "number",
										value: bankForm.latitude,
										onChange: (e) => setBankForm({
											...bankForm,
											latitude: e.target.value
										})
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Longitude",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "number",
										value: bankForm.longitude,
										onChange: (e) => setBankForm({
											...bankForm,
											longitude: e.target.value
										})
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Contact",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: bankForm.contact,
									onChange: (e) => setBankForm({
										...bankForm,
										contact: e.target.value
									})
								})
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: submitBankForm,
						disabled: busy,
						className: "h-9 w-full rounded-md bg-primary text-[13px] font-medium text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-60",
						children: editingBank ? "Save Changes" : "Add Blood Bank"
					})
				] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: !!detailsBank,
				onOpenChange: (open) => !open && setDetailsBank(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-xl",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: detailsBank?.name }) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-[12.5px] text-muted-foreground",
								children: [
									detailsBank?.city,
									" · ",
									detailsBank?.address
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: openAddBatch,
								className: "inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-[12.5px] font-medium text-primary-foreground hover:bg-primary/90",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" }), " Add Batch"]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 max-h-80 overflow-y-auto rounded-lg border border-border",
							children: inventoryLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "p-6 text-center text-[13px] text-muted-foreground",
								children: "Loading inventory…"
							}) : bankInventory.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "p-6 text-center text-[13px] text-muted-foreground",
								children: "No batches yet for this bank."
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "divide-y divide-border",
								children: bankInventory.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-3 px-4 py-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Droplet, { className: "h-4 w-4 shrink-0 text-primary" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "text-[13px] font-semibold text-foreground",
												children: [
													item.bloodGroup,
													" · ",
													item.component
												]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "text-[11.5px] text-muted-foreground",
												children: [
													item.units,
													" units · expires ",
													new Date(item.expiryDate).toLocaleDateString(),
													" · ",
													item.status
												]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => openEditBatch(item),
											className: "flex h-7 w-7 items-center justify-center rounded-md border border-border hover:bg-surface",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-3 w-3" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => {
												if (confirm("Remove this batch?")) deleteBatchMutation.mutate(item._id);
											},
											className: "flex h-7 w-7 items-center justify-center rounded-md border border-border text-red-600 hover:bg-red-50",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3 w-3" })
										})
									]
								}, item._id))
							})
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: batchFormOpen,
				onOpenChange: (open) => open ? setBatchFormOpen(true) : closeBatchForm(),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: editingBatch ? "Edit Batch" : "Add Batch" }) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3 py-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Blood Group",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
										value: batchForm.bloodGroup,
										onChange: (e) => setBatchForm({
											...batchForm,
											bloodGroup: e.target.value
										}),
										className: "h-9 w-full rounded-md border border-border bg-background px-2.5 text-[13px] outline-none",
										children: bloodGroups.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: g,
											children: g
										}, g))
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Component",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
										value: batchForm.component,
										onChange: (e) => setBatchForm({
											...batchForm,
											component: e.target.value
										}),
										className: "h-9 w-full rounded-md border border-border bg-background px-2.5 text-[13px] outline-none",
										children: components.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: c,
											children: c
										}, c))
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Units",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "number",
									min: 0,
									value: batchForm.units,
									onChange: (e) => setBatchForm({
										...batchForm,
										units: e.target.value
									})
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Expiry Date",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "date",
									value: batchForm.expiryDate,
									onChange: (e) => setBatchForm({
										...batchForm,
										expiryDate: e.target.value
									})
								})
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: submitBatchForm,
						disabled: busy,
						className: "h-9 w-full rounded-md bg-primary text-[13px] font-medium text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-60",
						children: editingBatch ? "Save Changes" : "Add Batch"
					})
				] })
			})
		]
	});
}
function Field({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
			className: "text-[12px] text-muted-foreground",
			children: label
		}), children]
	});
}
//#endregion
export { Banks as component };
