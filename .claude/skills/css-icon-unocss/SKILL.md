---
name: css-icon-unocss
description: 编写css、使用图标时，根据该规则编写unocss代码
version: 1.0.0
---

## trigger

当编写样式、图标、界面时，参考下面的规则。
关键词识别：样式、界面、图标

## rules

### 主题

unocss设置了一系列主题，当你编写一些需要颜色、大小的样式时，你需要从下面的主题进行选择：

```json
{
  "colors": {
    "primary": "rgb(var(--primary-color))",
    "primary-50": "rgb(var(--primary-50-color))",
    "primary-100": "rgb(var(--primary-100-color))",
    "primary-200": "rgb(var(--primary-200-color))",
    "primary-300": "rgb(var(--primary-300-color))",
    "primary-400": "rgb(var(--primary-400-color))",
    "primary-500": "rgb(var(--primary-500-color))",
    "primary-600": "rgb(var(--primary-600-color))",
    "primary-700": "rgb(var(--primary-700-color))",
    "primary-800": "rgb(var(--primary-800-color))",
    "primary-900": "rgb(var(--primary-900-color))",
    "primary-950": "rgb(var(--primary-950-color))",
    "info": "rgb(var(--info-color))",
    "info-50": "rgb(var(--info-50-color))",
    "info-100": "rgb(var(--info-100-color))",
    "info-200": "rgb(var(--info-200-color))",
    "info-300": "rgb(var(--info-300-color))",
    "info-400": "rgb(var(--info-400-color))",
    "info-500": "rgb(var(--info-500-color))",
    "info-600": "rgb(var(--info-600-color))",
    "info-700": "rgb(var(--info-700-color))",
    "info-800": "rgb(var(--info-800-color))",
    "info-900": "rgb(var(--info-900-color))",
    "info-950": "rgb(var(--info-950-color))",
    "success": "rgb(var(--success-color))",
    "success-50": "rgb(var(--success-50-color))",
    "success-100": "rgb(var(--success-100-color))",
    "success-200": "rgb(var(--success-200-color))",
    "success-300": "rgb(var(--success-300-color))",
    "success-400": "rgb(var(--success-400-color))",
    "success-500": "rgb(var(--success-500-color))",
    "success-600": "rgb(var(--success-600-color))",
    "success-700": "rgb(var(--success-700-color))",
    "success-800": "rgb(var(--success-800-color))",
    "success-900": "rgb(var(--success-900-color))",
    "success-950": "rgb(var(--success-950-color))",
    "warning": "rgb(var(--warning-color))",
    "warning-50": "rgb(var(--warning-50-color))",
    "warning-100": "rgb(var(--warning-100-color))",
    "warning-200": "rgb(var(--warning-200-color))",
    "warning-300": "rgb(var(--warning-300-color))",
    "warning-400": "rgb(var(--warning-400-color))",
    "warning-500": "rgb(var(--warning-500-color))",
    "warning-600": "rgb(var(--warning-600-color))",
    "warning-700": "rgb(var(--warning-700-color))",
    "warning-800": "rgb(var(--warning-800-color))",
    "warning-900": "rgb(var(--warning-900-color))",
    "warning-950": "rgb(var(--warning-950-color))",
    "error": "rgb(var(--error-color))",
    "error-50": "rgb(var(--error-50-color))",
    "error-100": "rgb(var(--error-100-color))",
    "error-200": "rgb(var(--error-200-color))",
    "error-300": "rgb(var(--error-300-color))",
    "error-400": "rgb(var(--error-400-color))",
    "error-500": "rgb(var(--error-500-color))",
    "error-600": "rgb(var(--error-600-color))",
    "error-700": "rgb(var(--error-700-color))",
    "error-800": "rgb(var(--error-800-color))",
    "error-900": "rgb(var(--error-900-color))",
    "error-950": "rgb(var(--error-950-color))",
    "nprogress": "rgb(var(--nprogress-color))",
    "container": "rgb(var(--container-bg-color))",
    "layout": "rgb(var(--layout-bg-color))",
    "inverted": "rgb(var(--inverted-bg-color))",
    "base-text": "rgb(var(--base-text-color))"
  },
  "boxShadow": {
    "header": "var(--header-box-shadow)",
    "sider": "var(--sider-box-shadow)",
    "tab": "var(--tab-box-shadow)"
  },
  "fontSize": {
    "icon-xs": "0.875rem",
    "icon-small": "1rem",
    "icon": "1.125rem",
    "icon-large": "1.5rem",
    "icon-xl": "2rem"
  }
}
```

使用样式时应该使用类似：text-primary、bg-layout等主题色

### 图标

图标可以使用unocss的icon class，比如：`i-material-symbols:123`
