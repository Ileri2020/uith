"use client";

import React, { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useAppContext } from "@/hooks/useAppContext";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface FormType {
  id: string;
  title: string;
  ownerId: string;
  fields: Record<string, string>;
  createdAt: string;
}

export default function MyFormsDataTable() {
  const { user } = useAppContext();
  const [forms, setForms] = useState<FormType[]>([]);
  const [loading, setLoading] = useState(true);

  // ---- Dialog State ----
  const [open, setOpen] = useState(false);
  const [activeForm, setActiveForm] = useState<FormType | null>(null);

  // -----------------------------------------------------------
  // FETCH all forms for the logged-in doctor
  // -----------------------------------------------------------
  useEffect(() => {
    if (!user) return;
    if (user.role !== "doctor") return;

    const fetchForms = async () => {
      setLoading(true);

      let url = `/api/dbhandler?model=form&ownerId=${user.id}`;

      try {
        const res = await fetch(url);
        const json = await res.json();
        setForms(json);
      } catch (err) {
        console.error("Error fetching forms:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchForms();
  }, [user]);

  // -----------------------------------------------------------
  // TABLE COLUMNS
  // -----------------------------------------------------------
  const columns: ColumnDef<FormType>[] = [
    {
      accessorKey: "title",
      header: "Form Title",
    },
    {
      accessorKey: "fields",
      header: "Field Count",
      cell: ({ row }) => {
        const count = Object.keys(row.original.fields ?? {}).length;
        return <Badge>{count} fields</Badge>;
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    },
  ];

  // -----------------------------------------------------------
  // OPEN EDITOR
  // -----------------------------------------------------------
  const openEditor = (form: FormType) => {
    setActiveForm({ ...form, fields: form.fields ?? {} });
    setOpen(true);
  };

  // -----------------------------------------------------------
  // UPDATE VALUE
  // -----------------------------------------------------------
  const updateFieldValue = (key: string, value: string) => {
    if (!activeForm) return;
    setActiveForm({
      ...activeForm,
      fields: {
        ...activeForm.fields,
        [key]: value,
      },
    });
  };

  // -----------------------------------------------------------
  // RENAME FIELD KEY
  // -----------------------------------------------------------
  const renameFieldKey = (oldKey: string, newKey: string) => {
    if (!activeForm) return;

    if (!newKey.trim()) return;

    // prevent overwriting another field
    if (newKey in activeForm.fields) {
      console.warn("Key already exists:", newKey);
      return;
    }

    const updated = { ...activeForm.fields };
    const value = updated[oldKey];

    delete updated[oldKey];
    updated[newKey] = value;

    setActiveForm({
      ...activeForm,
      fields: updated,
    });
  };

  // -----------------------------------------------------------
  // ADD FIELD
  // -----------------------------------------------------------
  const addField = () => {
    if (!activeForm) return;

    const newKey = `field_${Date.now()}`;

    setActiveForm({
      ...activeForm,
      fields: {
        ...activeForm.fields,
        [newKey]: "",
      },
    });
  };

  // -----------------------------------------------------------
  // REMOVE FIELD
  // -----------------------------------------------------------
  const removeField = (key: string) => {
    if (!activeForm) return;
    const updated = { ...activeForm.fields };
    delete updated[key];

    setActiveForm({
      ...activeForm,
      fields: updated,
    });
  };

  // -----------------------------------------------------------
  // SAVE CHANGES (PUT)
  // -----------------------------------------------------------
  const saveForm = async () => {
    if (!activeForm) return;

    const res = await fetch(`/api/dbhandler?model=form`, {
      method: "PUT",
      body: JSON.stringify({
        id: activeForm.id,
        title: activeForm.title,
        ownerId: activeForm.ownerId,
        fields: activeForm.fields,
      }),
    });

    const updated = await res.json();

    setForms((prev) =>
      prev.map((f) => (f.id === updated.id ? updated : f))
    );

    setOpen(false);
  };

  // -----------------------------------------------------------
  // RENDER
  // -----------------------------------------------------------

  if (loading) return <div className="p-4">Loading forms...</div>;

  return (
    <div className="p-2 bg-secondary rounded-lg shadow-lg">
      <div className="text-lg font-semibold mb-2">My Forms</div>

      <DataTable
        columns={columns}
        data={forms}
        searchColumn="title"
        onRowClick={openEditor}
      />

      {/* ──────────────── EDITOR DIALOG ──────────────── */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Form</DialogTitle>
          </DialogHeader>

          {activeForm && (
            <div className="space-y-4">

              {/* ---- Form Title ---- */}
              <div>
                <label className="text-sm font-medium">Form Title</label>
                <Input
                  value={activeForm.title}
                  onChange={(e) =>
                    setActiveForm({ ...activeForm, title: e.target.value })
                  }
                />
              </div>

              {/* ---- Fields Editor ---- */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-sm">Fields</h3>
                  <Button size="sm" onClick={addField}>+ Add Field</Button>
                </div>

                {Object.entries(activeForm.fields).map(([key, value]) => (
                  <div
                    key={key}
                    className="border p-2 rounded-md flex flex-col gap-2"
                  >
                    {/* Editable Field Key */}
                    <Input
                      defaultValue={key}
                      onBlur={(e) => {
                        const newKey = e.target.value.trim();
                        if (newKey && newKey !== key) {
                          renameFieldKey(key, newKey);
                        }
                      }}
                      placeholder="Field Name"
                    />

                    {/* Field Value */}
                    <Input
                      value={value}
                      onChange={(e) => updateFieldValue(key, e.target.value)}
                      placeholder="Field Value"
                    />

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeField(key)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>

            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setOpen(false)} variant="outline">
              Close
            </Button>
            <Button onClick={saveForm}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ============================================================================
   REUSABLE DATATABLE
============================================================================ */
const DataTable = ({ columns, data, onRowClick, searchColumn }: any) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div>
      <div className="flex items-center justify-between py-4">
        {searchColumn && (
          <Input
            placeholder="Search..."
            value={(table.getColumn(searchColumn)?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn(searchColumn)?.setFilterValue(event.target.value)
            }
            className="max-w-xs"
          />
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {group.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="cursor-pointer"
                onClick={() => onRowClick?.(row.original)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <button
          className="px-2 py-1 border rounded"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </button>
        <button
          className="px-2 py-1 border rounded"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </button>
      </div>
    </div>
  );
};
