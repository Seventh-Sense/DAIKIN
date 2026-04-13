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

export const unzipAndReadConfig = async (zipData: {
  filename: string;
  file_size: number;
  data: string;
}): Promise<any> => {
  const zip = new JSZip();

  // 关键：加载 base64 格式的 zip 数据
  await zip.loadAsync(zipData.data, { base64: true });

  // 读取固定文件名 objConfig.json
  const jsonFile = zip.files["objConfig.json"];
  if (!jsonFile) {
    throw new Error("压缩包内未找到 objConfig.json");
  }

  // 转字符串并解析 JSON
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
