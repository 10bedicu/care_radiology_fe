/* eslint-disable i18next/no-literal-string */
import { useEffect, useState } from "react";
import { apis } from "@/apis";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "./ui/dialog";

export default function EditAddModal({
  open,
  type, // "modality" | "bodypart" | "scanprotocol"
  editData,
  prefillData, // existing data for edit
  onClose,
  onSuccess,
}: {
  open: boolean;
  type: string;
  editData?: any;
  prefillData?: any;
  onClose: () => void;
  onSuccess: (savedItem: any) => void;
}) {
  const isEdit = Boolean(editData?.external_id);
  const [name, setName] = useState("");
  const [modalities, setModalities] = useState<any[]>([]);
  const [bodyParts, setBodyParts] = useState<any[]>([]);
  const [selectedModality, setSelectedModality] = useState("");
  const [selectedBodyPart, setSelectedBodyPart] = useState("");
  const { t } = useTranslation("care_radiology_fe");

  useEffect(() => {
    if (!open) return;

    // 🔹 RESET STATE (important)
    setName("");
    setSelectedModality("");
    setSelectedBodyPart("");

    // 🔹 Load dropdown data
    apis.modality.fetchAll().then((res) => setModalities(res.results));
    apis.bodyPart.fetchAll().then((res) => setBodyParts(res.results));

    // Edit mode prefill
    if (editData) {
      setName(editData.display_name || "");

      if (type === "bodypart") {
        setSelectedModality(editData.modality_id);
      }

      if (type === "scanprotocol") {
        setSelectedModality(editData.modality_id);
        setSelectedBodyPart(editData.body_part_id);
      }
      return;
    }
    // ADD MODE PREFILL
    if (prefillData) {
      setSelectedModality(prefillData.modality_id || "");
      setSelectedBodyPart(prefillData.body_part_id || "");
    }
  }, [open, editData, prefillData, type]);

  const handleSave = async () => {
    if (!name || name.trim().length < 2) {
      toast.warning(t("radiology_name_min_length"));
      return;
    }

    if ((type === "bodypart" || type === "scanprotocol") && !selectedModality) {
      toast.warning(t("radiology_select_modality"));
      return;
    }

    if (type === "scanprotocol" && !selectedBodyPart) {
      toast.warning(t("radiology_select_body_part"));
      return;
    }
    try {
      let savedItem = null;
      if (type === "modality") {
        savedItem = isEdit
          ? await apis.modality.update(editData.external_id, {
              display_name: name,
            })
          : await apis.modality.create({
              display_name: name,
              coding: [],
            });
      }

      if (type === "bodypart") {
        savedItem = isEdit
          ? await apis.bodyPart.update(editData.external_id, {
              display_name: name,
              modality: selectedModality,
            })
          : await apis.bodyPart.create({
              display_name: name,
              modality: selectedModality,
              coding: [],
            });
      }

      if (type === "scanprotocol") {
        savedItem = isEdit
          ? await apis.scanProtocol.update(editData.external_id, {
              display_name: name,
              modality: selectedModality,
              body_part: selectedBodyPart,
            })
          : await apis.scanProtocol.create({
              display_name: name,
              modality: selectedModality,
              body_part: selectedBodyPart,
              coding: [],
            });
      }
      toast.success(
        isEdit
          ? t("radiology_updated_successfully")
          : t("radiology_saved_successfully"),
      );

      onSuccess(savedItem);
      onClose();
    } catch (err) {
      console.error("Save failed:", err);
      toast.warning("Save failed!");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit" : "Add"}{" "}
            {type === "modality"
              ? "Modality"
              : type === "bodypart"
                ? "Body Part"
                : "Scan Protocol"}
          </DialogTitle>
        </DialogHeader>

        {/* Name Field */}
        <div className="mt-3">
          <label className="text-sm font-medium">{t("radiology_name")}</label>
          <Input
            className="mt-1"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("radiology_enter_name")}
          />
        </div>

        {/* Modality Dropdown for BodyPart/ScanProtocol */}
        {(type === "bodypart" || type === "scanprotocol") && (
          <div className="mt-3">
            <label className="text-sm font-medium">
              {t("radiology_modality_type")}
            </label>
            <select
              className="border w-full p-2 rounded-md mt-1"
              value={selectedModality}
              onChange={(e) => setSelectedModality(e.target.value)}
              disabled={
                isEdit && (type === "bodypart" || type === "scanprotocol")
              }
            >
              <option value="">{t("radiology_select")}</option>
              {modalities.map((m) => (
                <option key={m.external_id} value={m.external_id}>
                  {m.display_name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Body Part Dropdown for ScanProtocol */}
        {type === "scanprotocol" && (
          <div className="mt-3">
            <label className="text-sm font-medium">
              {t("radiology_body_part")}
            </label>

            <select
              className="border w-full p-2 rounded-md mt-1"
              value={selectedBodyPart}
              onChange={(e) => setSelectedBodyPart(e.target.value)}
              disabled={isEdit}
            >
              <option value="">{t("radiology_select")}</option>

              {bodyParts
                .filter((bp) => bp.modality_id === selectedModality)
                .map((bp) => (
                  <option key={bp.external_id} value={bp.external_id}>
                    {bp.display_name}
                  </option>
                ))}
            </select>
          </div>
        )}
        <DialogFooter className="mt-5">
          <Button variant="outline" onClick={onClose}>
            {t("radiology_cancel")}
          </Button>
          <Button onClick={handleSave}>
            {isEdit ? t("radiology_update") : t("radiology_save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
