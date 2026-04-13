import JSZip from "jszip";

export const generateConfigZipFile = async (data: any): Promise<File> => {
  const jsonStr = JSON.stringify(data, null, 2);
  const zip = new JSZip();
  zip.file("objConfig.json", jsonStr);

  const zipBlob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  return new File([zipBlob], "objConfig.zip", { type: "application/zip" });
};
