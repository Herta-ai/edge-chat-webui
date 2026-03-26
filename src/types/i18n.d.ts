declare module 'vue-i18n' {
  // 让 vue-i18n 内部的 Message 类型继承你的 Schema
  export interface DefineLocaleMessage extends I18N.Schema {
  }
}

/**
 * I18N namespace
 *
 * Locales type
 */
declare namespace I18N {
  type RouteKey = import('@elegant-router/types').RouteKey

  type LangType = 'en-US' | 'zh-CN'

  interface LangOption {
    label: string
    key: LangType
  }

  type I18nRouteKey = Exclude<RouteKey, 'root' | 'not-found'>

  interface FormMsg {
    required: string
    invalid: string
  }

  interface Schema {
    system: {
      title: string
      updateTitle: string
      updateContent: string
      updateConfirm: string
      updateCancel: string
    }
    common: {
      action: string
      add: string
      addSuccess: string
      backToHome: string
      batchDelete: string
      cancel: string
      close: string
      check: string
      selectAll: string
      expandColumn: string
      columnSetting: string
      config: string
      confirm: string
      delete: string
      deleteSuccess: string
      confirmDelete: string
      edit: string
      warning: string
      error: string
      index: string
      keywordSearch: string
      logout: string
      logoutConfirm: string
      lookForward: string
      modify: string
      modifySuccess: string
      noData: string
      operate: string
      pleaseCheckValue: string
      refresh: string
      reset: string
      search: string
      switch: string
      tip: string
      trigger: string
      update: string
      updateSuccess: string
      userCenter: string
      yesOrNo: {
        yes: string
        no: string
      }
    }
    request: {
      logout: string
      logoutMsg: string
      logoutWithModal: string
      logoutWithModalMsg: string
      refreshToken: string
      tokenExpired: string
    }
    theme: {
      themeDrawerTitle: string
      tabs: {
        appearance: string
        layout: string
        general: string
        preset: string
      }
      appearance: {
        themeSchema: { title: string } & Record<UnionKey.ThemeScheme, string>
        grayscale: string
        colourWeakness: string
        themeColor: {
          title: string
          followPrimary: string
        } & Record<App.Theme.ThemeColorKey, string>
        recommendColor: string
        recommendColorDesc: string
        themeRadius: {
          title: string
        }
        preset: {
          title: string
          apply: string
          applySuccess: string
          [key: string]:
            | {
              name: string
              desc: string
            }
            | string
        }
      }
      layout: {
        layoutMode: { title: string } & Record<UnionKey.ThemeLayoutMode, string> & {
          [K in `${UnionKey.ThemeLayoutMode}_detail`]: string
        }
        tab: {
          title: string
          visible: string
          cache: string
          cacheTip: string
          height: string
          mode: { title: string } & Record<UnionKey.ThemeTabMode, string>
          closeByMiddleClick: string
          closeByMiddleClickTip: string
        }
        header: {
          title: string
          height: string
          breadcrumb: {
            visible: string
            showIcon: string
          }
        }
        sider: {
          title: string
          inverted: string
          width: string
          collapsedWidth: string
          mixWidth: string
          mixCollapsedWidth: string
          mixChildMenuWidth: string
          autoSelectFirstMenu: string
          autoSelectFirstMenuTip: string
        }
        footer: {
          title: string
          visible: string
          fixed: string
          height: string
          right: string
        }
        content: {
          title: string
          scrollMode: { title: string, tip: string } & Record<UnionKey.ThemeScrollMode, string>
          page: {
            animate: string
            mode: { title: string } & Record<UnionKey.ThemePageAnimateMode, string>
          }
          fixedHeaderAndTab: string
        }
      }
      general: {
        title: string
        watermark: {
          title: string
          visible: string
          text: string
          enableUserName: string
          enableTime: string
          timeFormat: string
        }
        multilingual: {
          title: string
          visible: string
        }
        globalSearch: {
          title: string
          visible: string
        }
      }
      configOperation: {
        copyConfig: string
        copySuccessMsg: string
        resetConfig: string
        resetSuccessMsg: string
      }
    }
    route: Record<I18nRouteKey, string>
    page: {
      wizard: {
        skip: string
        prev: string
        next: string
        complete: string
        step1Title: string
        step1Desc: string
        step2Title: string
        step2Desc: string
        step3Title: string
        step3Desc: string
      }
      home: {
        branchDesc: string
        greeting: string
        weatherDesc: string
        projectCount: string
        todo: string
        message: string
        downloadCount: string
        registerCount: string
        schedule: string
        study: string
        work: string
        rest: string
        entertainment: string
        visitCount: string
        turnover: string
        dealCount: string
        projectNews: {
          title: string
          moreNews: string
          desc1: string
          desc2: string
          desc3: string
          desc4: string
          desc5: string
        }
        creativity: string
      }
    }
    form: {
      required: string
      userName: FormMsg
      phone: FormMsg
      pwd: FormMsg
      confirmPwd: FormMsg
      code: FormMsg
      email: FormMsg
    }
    dropdown: Record<App.Global.DropdownKey, string>
    icon: {
      themeConfig: string
      themeSchema: string
      lang: string
      fullscreen: string
      fullscreenExit: string
      reload: string
      collapse: string
      expand: string
      pin: string
      unpin: string
    }
    datatable: {
      itemCount: string
      fixed: {
        left: string
        right: string
        unFixed: string
      }
    }
  }

  type GetI18nKey<T, K extends keyof T = keyof T> = K extends string
    ? NonNullable<T[K]> extends object
      ? `${K}.${GetI18nKey<NonNullable<T[K]>>}`
      : K
    : never

  type I18nKey = GetI18nKey<Schema>

  interface TranslateOptions<Locales extends string = string> {
    list?: unknown[] // 数组插值参数
    named?: Record<string, unknown> // 对象插值参数
    plural?: number // 复数形式
    default?: string // 默认文本
    locale?: Locales // 指定语言
    fallbackWarn?: boolean // 是否屏蔽降级警告
    missingWarn?: boolean // 是否屏蔽缺失警告
    resolveMessageType?: 'text' | 'message'
  }

  interface $T {
    (key: I18nKey): string

    (key: I18nKey, plural: number, options?: TranslateOptions<LangType>): string

    (key: I18nKey, defaultMsg: string, options?: TranslateOptions<I18nKey>): string

    (key: I18nKey, list: unknown[], options?: TranslateOptions<I18nKey>): string

    (key: I18nKey, list: unknown[], plural: number): string

    (key: I18nKey, list: unknown[], defaultMsg: string): string

    (key: I18nKey, named: Record<string, unknown>, options?: TranslateOptions<LangType>): string

    (key: I18nKey, named: Record<string, unknown>, plural: number): string

    (key: I18nKey, named: Record<string, unknown>, defaultMsg: string): string
  }
}
