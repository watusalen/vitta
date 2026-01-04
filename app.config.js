const fs = require("fs");
const path = require("path");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const content = fs.readFileSync(filePath, "utf8");
  const result = {};

  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      return;
    }
    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      return;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    result[key] = value;
  });

  return result;
}

module.exports = ({ config }) => {
  const env = loadEnvFile(path.join(__dirname, ".env"));
  const extra = { ...(config.extra || {}) };

  Object.entries(env).forEach(([key, value]) => {
    if (key.startsWith("EXPO_PUBLIC_")) {
      extra[key] = value;
    }
  });

  return {
    ...config,
    extra,
  };
};
