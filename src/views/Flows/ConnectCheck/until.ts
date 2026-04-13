import JSZip from "jszip";

export const controllerFileName = "objConfig/objConfig.zip";

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

export const unzipAndReadConfig = async (zipBlob: Blob): Promise<any> => {
  const zip = new JSZip();
  const content = await zip.loadAsync(zipBlob);

  // 读取 json 文件
  const jsonFile = content.files["objConfig.json"];
  if (!jsonFile) throw new Error("压缩包内无 objConfig.json");

  const jsonStr = await jsonFile.async("string");
  return JSON.parse(jsonStr);
};

export const isDataEqual = (obj1: any, obj2: any): boolean => {
  // 简单场景可用JSON.stringify，复杂场景建议用lodash的isEqual
  try {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  } catch (error) {
    console.error("数据对比失败", error);
    return false;
  }
};