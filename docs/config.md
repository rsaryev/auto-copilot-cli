# Set Config

## Description

Set configuration

## Usage

```bash
# Set openai api key
$ copilot config OPENAI_API_KEY <api_key>

# Set openai base url Default: https://api.openai.com/v1
$ copilot config OPEN_AI_BASE_URL <base_url>

# Set openai model Default: gpt-3.5-turbo
$ copilot config MODEL <model>

# Set config commit with description Default: no
copilot config INCLUDE_COMMIT_DESCRIPTION yes

# Set config commit without description Default: no
copilot config INCLUDE_COMMIT_DESCRIPTION no

# Set config package manager Default: brew
# For determine which package manager to recommend in generated shell scripts
copilot config PACKAGE_MANAGER brew
```

Get Config
```bash
# Print config
$ copilot get-config
```