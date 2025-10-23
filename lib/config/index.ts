// Configuration management exports
export { ConfigSchema, type Config, type ModuleConfig } from './schema';
export { loadConfig, configExists, ConfigLoadError } from './loader';
export {
  ConfigurationManager,
  ConfigError,
  CONFIG_ERROR_CODES,
  CONFIG_LOCATIONS,
  type ConfigUpdateCallback,
  type IntegrityCheckResult,
  getConfigManager,
  resetConfigManager,
  createConfigManager,
} from './manager';
