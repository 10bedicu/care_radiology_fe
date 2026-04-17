import { useState, useEffect, useRef } from "react";
import { apis } from "@/apis";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import Quill from "quill";
import Editor from "./ui/quilleditor";
import { Plus, Pencil, Info } from "lucide-react"; // icons
import EditAddModal from "./EditAddModal";
import { toast, Toaster } from "sonner";
import { useTranslation } from "react-i18next";
import RadiologyAuditPopup from "./Common/RadiologyAuditPopup";
import { APIError } from "@/apis/request";

export default function DicomReport({
  studyUid
}: {
  studyUid: string;
}) {
  
  const [modalities, setModalities] = useState<any[]>([]);
  const [bodyParts, setBodyParts] = useState<any[]>([]);
  const [scanProtocols, setScanProtocols] = useState<any[]>([]);
  const [initialLoaded, setInitialLoaded] = useState(false);

  const [modalType, setModalType] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  const [selectedModality, setSelectedModality] = useState("");
  const [selectedBodyPart, setSelectedBodyPart] = useState("");
  const [selectedScanProtocol, setSelectedScanProtocol] = useState("");

  const [loadingModalities, setLoadingModalities] = useState(false);
  const [loadingBodyParts, setLoadingBodyParts] = useState(false);
  const [loadingScanProtocols, setLoadingScanProtocols] = useState(false);

  const [showTemplatePrompt, setShowTemplatePrompt] = useState(false);
  const [templateData, setTemplateData] = useState<any>(null);

  const [reportExists, setReportExists] = useState(false);
  const [showOverwriteConfirm, setShowOverwriteConfirm] = useState(false);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  const [studyReportId, setStudyReportId] = useState<string | null>(null);
  const [showAuditPopup, setShowAuditPopup] = useState(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);


  const { t } = useTranslation("care_radiology_fe");
  const techniqueRef = useRef<Quill | null>(null);
  const findingsRef = useRef<Quill | null>(null);
  const impressionRef = useRef<Quill | null>(null);

  useEffect(() => {
    if (modalities.length === 0 || initialLoaded) return;

    const init = async () => {
      try {
        // STUDY REPORT FIRST
        const reportRes = await apis.studyReport.fetchByStudy(studyUid);
        if (reportRes && reportRes?.results?.length > 0) {
          const r = reportRes.results[0];
          setStudyReportId(r.external_id);
          setSelectedModality(r.modality_id);
          setSelectedBodyPart(r.body_part_id);
          setSelectedScanProtocol(r.scan_protocol_id);
          techniqueRef.current?.clipboard.dangerouslyPasteHTML(
            r.technique || "",
          );
          findingsRef.current?.clipboard.dangerouslyPasteHTML(r.findings || "");
          impressionRef.current?.clipboard.dangerouslyPasteHTML(
            r.impression || "",
          );
          setReportExists(true);
          setInitialLoaded(true);
          return;
        }

        //  DICOM STUDY SECOND
        const ds = await apis.dicom.fetchOne(studyUid);
        if (ds?.study_modality_id) {
          const matched = modalities.find(
            (m) => m.external_id === ds.study_modality_id,
          );
          if (matched) {
            setSelectedModality(matched.external_id);
          }
          setInitialLoaded(true);
          return;
        }

        // EMPTY STATE THIRD
        setSelectedModality("");
        setSelectedBodyPart("");
        setSelectedScanProtocol("");
        setInitialLoaded(true);
      } catch (err) {
        if ((err as APIError).status == 403) {
          return toast.error((err as APIError).message)
        }
        console.error("Init failed", err);
      }
    };
    init();
  }, [modalities]);

  useEffect(() => {
    if (
      !selectedModality ||
      !selectedBodyPart ||
      !selectedScanProtocol
    ) {
      return;
    }
    // Skip ONLY first time when report exists
    if (!initialCheckDone && reportExists) {
      setInitialCheckDone(true);
      return;
    }
    const checkTemplate = async () => {
      try {
      const res = (await apis.template.fetchAll()) as { results: any[] };
      const match = res.results.find(
        (t) =>
          t.modality_id === selectedModality &&
          t.body_part_id === selectedBodyPart &&
          t.scan_protocol_id === selectedScanProtocol,
      );
      if (match) {
        setTemplateData(match);
        setShowTemplatePrompt(true);
      } 
      } finally {
        setInitialCheckDone(true);
      }
    };
    checkTemplate();
  }, [selectedModality, selectedBodyPart, selectedScanProtocol]);

  useEffect(() => {
    if (showAuditPopup && studyReportId) {
      apis.studyReportAudit
        .fetchByStudyReport(studyReportId)
        .then((res) => {
          setAuditLogs(res.results || []);
        });
    }
  }, [showAuditPopup, studyReportId]);

  // Fetch all modalities
  useEffect(() => {
    const fetchModalities = async () => {
      try {
        setLoadingModalities(true);
        const data = await apis.modality.fetchAll();
        setModalities(data.results);
      } catch (err) {
        console.error("Failed to load modality types", err);
      } finally {
        setLoadingModalities(false);
      }
    };
    fetchModalities();
  }, []);

  // Fetch BodyParts based on selected modality
  useEffect(() => {
    if (!selectedModality) return;
    const fetchBodyParts = async () => {
      try {
        setLoadingBodyParts(true);
        const data = await apis.bodyPart.fetchAll();
        //FILTER BY ID
        const filtered = data.results.filter(
          (bp: any) => bp.modality_id === selectedModality,
        );
        setBodyParts(filtered);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingBodyParts(false);
      }
    };
    fetchBodyParts();
  }, [selectedModality]);

  // Fetch ScanProtocols based on selected modality & body_part
  useEffect(() => {
    if (!selectedModality || !selectedBodyPart) return;
    const fetchScanProtocols = async () => {
      try {
        setLoadingScanProtocols(true);
        const data = await apis.scanProtocol.fetchAll();
        // FILTER BY IDs
        const filtered = data.results.filter(
          (sp) =>
            sp.modality_id === selectedModality &&
            sp.body_part_id === selectedBodyPart,
        );
        setScanProtocols(filtered);
        // auto-select ONLY for fresh flow
        /* if (!selectedScanProtocol && filtered.length > 0) {
          setSelectedScanProtocol(filtered[0].external_id);
        } */
      } catch (err) {
        console.error("Failed to load scan protocols", err);
      } finally {
        setLoadingScanProtocols(false);
      }
    };
    fetchScanProtocols();
  }, [selectedModality, selectedBodyPart]);

  const getEditorText = (ref: React.RefObject<Quill | null>) => {
    const html = ref.current?.root.innerHTML || "";
    const text = html.replace(/<(.|\n)*?>/g, "").trim(); // strip HTML
    return { html, text };
  };
  const canPreview = reportExists;
  const validateReportFields = () => {
    if (!selectedModality) {
      toast.warning(t("radiology_please_select_modality"));
      return false;
    }
    if (!selectedBodyPart) {
      toast.warning(t("radiology_please_select_body_part"));
      return false;
    }
    if (!selectedScanProtocol) {
      toast.warning(t("radiology_please_select_scan_protocol"));
      return false;
    }
    const technique = getEditorText(techniqueRef);
    if (!technique.text) {
      toast.warning(t("radiology_please_fill_technique"));
      return false;
    }
    const findings = getEditorText(findingsRef);
    if (!findings.text) {
      toast.warning(t("radiology_please_fill_findings"));
      return false;
    }
    const impression = getEditorText(impressionRef);
    if (!impression.text) {
      toast.warning(t("radiology_please_fill_impression"));
      return false;
    }
    return true;
  };

  const handleCancel = () => window.history.back();

  const handleSave = async () => {
    if (reportExists) {
      setShowOverwriteConfirm(true);
      return;
    }
    await saveReport();
  };
  const saveReport = async () => {
    if (!validateReportFields()) return;
    const techniqueContent = techniqueRef.current?.root.innerHTML;
    const findingsContent = findingsRef.current?.root.innerHTML;
    const impressionContent = impressionRef.current?.root.innerHTML;
    try {
      const res = (await apis.studyReport.create({
        study: studyUid,
        modality: selectedModality,
        body_part: selectedBodyPart,
        scan_protocol: selectedScanProtocol,
        technique: techniqueContent,
        findings: findingsContent,
        impression: impressionContent,
      })) as { external_id: string };
      if (res?.external_id) {
        setStudyReportId(res.external_id);
      }
      toast.success(t("radiology_report_saved_successfully!"));
      setReportExists(true);
    } catch (err) {
      if ((err as APIError).status == 403) {
        return toast.error((err as APIError).message)
      } else {
        toast.error(t("radiology_error_saving_report"));
      }
    }
  };

  const handlePreview = () => {
      
    window.open(
      `/radiology/report/${studyUid}/preview`,
      "_blank",
    );
  };

  const handleSaveAsTemplate = async () => {
    if (!validateReportFields()) return;
    const techniqueContent = techniqueRef.current?.root.innerHTML;
    const findingsContent = findingsRef.current?.root.innerHTML;
    const impressionContent = impressionRef.current?.root.innerHTML;
    try {
      await apis.template.create({
        modality: selectedModality,
        body_part: selectedBodyPart,
        scan_protocol: selectedScanProtocol,
        technique: techniqueContent,
        findings: findingsContent,
        impression: impressionContent,
      });
      toast.success(t("radiology_template_saved_successfully!"));
    } catch (err) {
      console.error("Error saving template:", err);
      toast.error(t("radiology_failed_to_save_template"));
    }
  };

  // Placeholder handlers for buttons (can be expanded later)
  const handleAdd = (type: string) => {
    setModalType(type);
    setEditItem(null);
    setModalOpen(true);
  };

  const handleEdit = (type: string) => {
    let item = null;
    if (type === "modality") {
      item = modalities.find((m) => m.external_id === selectedModality);
    } else if (type === "bodypart") {
      item = bodyParts.find((bp) => bp.external_id === selectedBodyPart);
    } else if (type === "scanprotocol") {
      item = scanProtocols.find(
        (sp) => sp.external_id === selectedScanProtocol,
      );
    }
    if (!item)
      return toast.warning(t("radiology_please_select_an_item_to_edit"));
    setModalType(type);
    setEditItem(item);
    setModalOpen(true);
  };

  return (
    <Card
      data-study-uid={studyUid}
      className="shadow-sm border bg-white w-full h-full"
    >
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-xl font-semibold text-gray-800">
          {t("radiology_dicom_report")}
        </CardTitle>
        <Info
          size={20}
          className="cursor-pointer text-gray-600 hover:text-blue-600"
          onClick={() => setShowAuditPopup(true)}
        />
      </CardHeader>

      <CardContent className="w-full">
        <div className="flex flex-row gap-4 w-full h-[80vh]">
          {/* Left Sidebar */}
          <div className="w-1/4 min-w-[250px] border rounded-lg p-3 bg-gray-50 flex flex-col justify-between">
            <div>
              {/* Modality Section */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-sm text-gray-700">
                    {t("radiology_modality_type")}
                  </h4>
                  <div className="flex gap-1">
                    <Plus
                      size={16}
                      className="cursor-pointer"
                      onClick={() => handleAdd("modality")}
                    />
                    <Pencil
                      size={16}
                      className="cursor-pointer"
                      onClick={() => handleEdit("modality")}
                    />
                  </div>
                </div>
                {loadingModalities ? (
                  <div className="text-sm text-gray-500">
                    {t("radiology_loading")}
                  </div>
                ) : (
                  <select
                    value={selectedModality}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSelectedModality(value);
                      //RESET DEPENDENTS
                      setSelectedBodyPart("");
                      setSelectedScanProtocol("");
                      setBodyParts([]);
                      setScanProtocols([]);
                      setInitialLoaded(false);
                    
                    }}
                    className="w-full border rounded-md text-sm p-2"
                  >
                    <option value="">{t("radiology_select_modality")}</option>
                    {modalities.map((mod) => (
                      <option key={mod.external_id} value={mod.external_id}>
                        {mod.display_name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Body Part Section */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-sm text-gray-700">
                    {t("radiology_body_part")}
                  </h4>
                  <div className="flex gap-1">
                    <Plus
                      size={16}
                      className="cursor-pointer"
                      onClick={() => handleAdd("bodypart")}
                    />
                    <Pencil
                      size={16}
                      className="cursor-pointer"
                      onClick={() => handleEdit("bodypart")}
                    />
                  </div>
                </div>
                {loadingBodyParts ? (
                  <div className="text-sm text-gray-500">
                    {t("radiology_loading")}
                  </div>
                ) : (
                  <div className="min-h-[200px] max-h-[250px] overflow-y-auto border rounded-md p-2 bg-white text-sm">
                    {bodyParts.map((bp) => (
                      <div
                        key={bp.external_id}
                        onClick={() => {
                          setSelectedBodyPart(bp.external_id);
                          // reset dependent
                          setSelectedScanProtocol("");
                          setScanProtocols([]);
                          setInitialLoaded(false);
                          
                        }}
                        className={`p-1 rounded-md cursor-pointer mb-1 hover:bg-blue-100 ${
                          selectedBodyPart === bp.external_id
                            ? "bg-blue-200"
                            : ""
                        }`}
                      >
                        {bp.display_name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Scan Protocol Section */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-sm text-gray-700">
                    {t("radiology_scan_protocol")}
                  </h4>
                  <div className="flex gap-1">
                    <Plus
                      size={16}
                      className="cursor-pointer"
                      onClick={() => handleAdd("scanprotocol")}
                    />
                    <Pencil
                      size={16}
                      className="cursor-pointer"
                      onClick={() => handleEdit("scanprotocol")}
                    />
                  </div>
                </div>
                {loadingScanProtocols ? (
                  <div className="text-sm text-gray-500">
                    {t("radiology_loading")}
                  </div>
                ) : (
                  <div className="min-h-[200px] max-h-[250px] overflow-y-auto border rounded-md p-2 bg-white text-sm">
                    {scanProtocols.map((sp) => (
                      <div
                        key={sp.external_id}
                        onClick={() => setSelectedScanProtocol(sp.external_id)}
                        className={`p-1 rounded-md cursor-pointer mb-1 hover:bg-blue-100 ${
                          selectedScanProtocol === sp.external_id
                            ? "bg-blue-200"
                            : ""
                        }`}
                      >
                        {sp.display_name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Report Section */}
          <div className="flex-1 border rounded-lg p-4 bg-gray-50 overflow-y-auto">
            <div className="flex flex-col gap-4 h-full">
              {/* Scan Name display */}
              <div>
                <label className="font-medium text-gray-700 text-sm">
                  {t("radiology_scan_protocol")}
                </label>
                <Input
                  value={
                    scanProtocols.find(
                      (sp) => sp.external_id === selectedScanProtocol,
                    )?.display_name || ""
                  }
                  readOnly
                  className="bg-gray-100 mt-1"
                />
              </div>

              {/* Technique */}
              <div>
                <label className="font-medium text-gray-700 text-sm">
                  {t("radiology_technique")}
                </label>
                <div className="border rounded-md bg-white mt-1">
                  <Editor ref={techniqueRef} height={105} />
                </div>
              </div>

              {/* Findings */}
              <div>
                <label className="font-medium text-gray-700 text-sm">
                  {t("radiology_findings")}
                </label>
                <div className="border rounded-md bg-white mt-1">
                  <Editor ref={findingsRef} height={105} />
                </div>
              </div>

              {/* Impression */}
              <div>
                <label className="font-medium text-gray-700 text-sm">
                  {t("radiology_impression")}
                </label>
                <div className="border rounded-md bg-white mt-1">
                  <Editor ref={impressionRef} height={105} />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-between items-center gap-4 mt-auto">
                <div className="flex justify-start gap-4">
                  <Button variant="outline" onClick={handleSaveAsTemplate}>
                    {t("radiology_save_as_template")}
                  </Button>
                  {canPreview && (
                  <Button variant="outline" onClick={handlePreview}>
                    {t("radiology_preview")}
                  </Button>
                  )}
                </div>
                <div className="flex justify-end gap-4">
                  <Button variant="secondary" onClick={handleCancel}>
                    {t("radiology_cancel")}
                  </Button>
                  <Button variant="primary" onClick={handleSave}>
                    {t("radiology_save")}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      {showTemplatePrompt && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-[400px] relative p-5">
            <h3 className="text-lg font-semibold mb-2">
              {t("radiology_template_found")}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {t("radiology_template_exists_for_user")}
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  techniqueRef.current?.setText("");
                  findingsRef.current?.setText("");
                  impressionRef.current?.setText("");
                  setShowTemplatePrompt(false);
                  setInitialLoaded(true);
                }}
              >
                {t("radiology_start_fresh")}
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                // Keep whatever user already typed
                setShowTemplatePrompt(false);
                setInitialLoaded(true);
                }}
              >
                {t("radiology_use_existing")}
              </Button>

              <Button
                onClick={async () => {
                  if (!templateData) return;
                  //  IMPORTANT: Use id fields
                  setSelectedModality(templateData.modality_id);
                  // wait for body parts to load
                  await new Promise((r) => setTimeout(r, 300));
                  setSelectedBodyPart(templateData.body_part_id);
                  // wait for scan protocols
                  await new Promise((r) => setTimeout(r, 300));
                  setSelectedScanProtocol(templateData.scan_protocol_id);
                  techniqueRef.current?.clipboard.dangerouslyPasteHTML(
                    templateData.technique || "",
                  );
                  findingsRef.current?.clipboard.dangerouslyPasteHTML(
                    templateData.findings || "",
                  );
                  impressionRef.current?.clipboard.dangerouslyPasteHTML(
                    templateData.impression || "",
                  );
                  setShowTemplatePrompt(false);
                  setInitialLoaded(true);
                }}
              >
                {t("radiology_use_template")}
              </Button>
            </div>
          </div>
        </div>
      )}
      {showOverwriteConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-[400px] relative p-5">
            <h3 className="text-lg font-semibold mb-2 text-red-600">
              {t("radiology_overwrite_report")}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {t("radiology_report_exists_for_study")}
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowOverwriteConfirm(false)}
              >
                {t("radiology_cancel")}
              </Button>

              <Button
                variant="destructive"
                onClick={async () => {
                  setShowOverwriteConfirm(false);
                  await saveReport();
                }}
              >
                {t("radiology_overwrite")}
              </Button>
            </div>
          </div>
        </div>
      )}
      <EditAddModal
        open={modalOpen}
        type={modalType}
        editData={editItem}
        prefillData={{
          modality_id: selectedModality,
          body_part_id: selectedBodyPart,
        }}
        onClose={() => setModalOpen(false)}
        onSuccess={async (savedItem: any) => {
          // reload data after add/edit
          if (modalType === "modality") {
            const r = await apis.modality.fetchAll();
            setModalities(r.results);
            if (savedItem?.external_id) {
              setSelectedModality(savedItem.external_id);
              if (!editItem) {
                setSelectedBodyPart("");
                setSelectedScanProtocol("");
                setScanProtocols([]);
              }  
              setInitialLoaded(true);
            }
          }
          if (modalType === "bodypart") {
            const r = await apis.bodyPart.fetchAll();
            setBodyParts(
              r.results.filter((bp) => bp.modality_id === selectedModality),
            );
            if (savedItem?.external_id) {
              setSelectedBodyPart(savedItem.external_id);
              if (!editItem) {
                setSelectedScanProtocol("");
              }  
            }
          }
          if (modalType === "scanprotocol") {
            const r = await apis.scanProtocol.fetchAll();
            setScanProtocols(
              r.results.filter(
                (sp) =>
                  sp.modality_id === selectedModality &&
                  sp.body_part_id === selectedBodyPart,
              ),
            );
            if (savedItem?.external_id) {
              setSelectedScanProtocol(savedItem.external_id);
            }
          }
        }}
      />
      <RadiologyAuditPopup
        open={showAuditPopup}
        onClose={() => setShowAuditPopup(false)}
        audits={auditLogs}
      />
      <Toaster position="top-center" richColors closeButton />
    </Card>
  );
}
