import { exportImportProcessGuide } from "../data/exportImportGuide.js";

const getExportImportProcessGuide = (req, res) => {
    res.set("Cache-Control", "public, max-age=300");
    res.json({
        success: true,
        guideName: "Export-Import Starter Guide",
        ...exportImportProcessGuide,
    });
};

export { getExportImportProcessGuide };
