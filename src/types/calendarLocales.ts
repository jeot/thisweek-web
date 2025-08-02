import { WeekdayNumbers } from "./types";

// Auto-generated calendar locale metadata
export type CalendarType =
  | "gregory"
  | "chinese"
  | "hebrew"
  | "islamic"
  | "japanese"
  | "indian"
  | "persian"
  | "iso8601"
  | "buddhist"
  | "roc"
  | "coptic"
  | "ethiopic"
  | "ethiopia"

export interface CalendarLocaleMeta {
  locale: string;
  displayName: string;
  startWeekday: WeekdayNumbers;
  //startWeekday: number; // 0 = Sunday, 1 = Monday
}

export interface CalendarMeta {
  name: CalendarType;
  displayName: string;
  locales: CalendarLocaleMeta[];
}

export const calendars: CalendarMeta[] = [
  {
    "name": "gregory",
    "displayName": "Gregory",
    "locales": [
      {
        "locale": "en-US",
        "displayName": "English (United States)",
        "startWeekday": 0
      },
      {
        "locale": "en-GB",
        "displayName": "English (United Kingdom)",
        "startWeekday": 1
      },
      {
        "locale": "fr-FR",
        "displayName": "Fran\u00e7ais (France)",
        "startWeekday": 1
      },
      {
        "locale": "de-DE",
        "displayName": "Deutsch (Germany)",
        "startWeekday": 1
      },
      {
        "locale": "es-ES",
        "displayName": "Espa\u00f1ol (Spain)",
        "startWeekday": 1
      },
      {
        "locale": "it-IT",
        "displayName": "Italiano (Italy)",
        "startWeekday": 1
      },
      {
        "locale": "nl-NL",
        "displayName": "Nederlands (Netherlands)",
        "startWeekday": 1
      },
      {
        "locale": "pt-PT",
        "displayName": "Portugu\u00eas (Portugal)",
        "startWeekday": 1
      },
      {
        "locale": "pt-BR",
        "displayName": "Portugu\u00eas (Brazil)",
        "startWeekday": 0
      },
      {
        "locale": "ru-RU",
        "displayName": "\u0420\u0443\u0441\u0441\u043a\u0438\u0439 (Russia)",
        "startWeekday": 1
      },
      {
        "locale": "ko-KR",
        "displayName": "\ud55c\uad6d\uc5b4 (South Korea)",
        "startWeekday": 0
      },
      {
        "locale": "ja-JP",
        "displayName": "\u65e5\u672c\u8a9e (Japan)",
        "startWeekday": 0
      },
      {
        "locale": "zh-CN",
        "displayName": "\u4e2d\u6587 (China)",
        "startWeekday": 0
      },
      {
        "locale": "zh-TW",
        "displayName": "\u4e2d\u6587 (Taiwan)",
        "startWeekday": 0
      },
      {
        "locale": "tr-TR",
        "displayName": "T\u00fcrk\u00e7e (Turkey)",
        "startWeekday": 1
      },
      {
        "locale": "fa-IR",
        "displayName": "\u0641\u0627\u0631\u0633\u06cc (Iran)",
        "startWeekday": 6
      },
      {
        "locale": "ar-SA",
        "displayName": "\u0627\u0644\u0639\u0631\u0628\u064a\u0629 (Saudi Arabia)",
        "startWeekday": 0
      },
      {
        "locale": "ar-EG",
        "displayName": "\u0627\u0644\u0639\u0631\u0628\u064a\u0629 (Egypt)",
        "startWeekday": 6
      },
      {
        "locale": "pl-PL",
        "displayName": "Polski (Poland)",
        "startWeekday": 1
      },
      {
        "locale": "uk-UA",
        "displayName": "\u0423\u043a\u0440\u0430\u0457\u043d\u0441\u044c\u043a\u0430 (Ukraine)",
        "startWeekday": 1
      },
      {
        "locale": "ro-RO",
        "displayName": "Rom\u00e2n\u0103 (Romania)",
        "startWeekday": 1
      },
      {
        "locale": "cs-CZ",
        "displayName": "\u010ce\u0161tina (Czech Republic)",
        "startWeekday": 1
      },
      {
        "locale": "sv-SE",
        "displayName": "Svenska (Sweden)",
        "startWeekday": 1
      },
      {
        "locale": "no-NO",
        "displayName": "Norsk (Norway)",
        "startWeekday": 1
      },
      {
        "locale": "da-DK",
        "displayName": "Dansk (Denmark)",
        "startWeekday": 1
      },
      {
        "locale": "fi-FI",
        "displayName": "Suomi (Finland)",
        "startWeekday": 1
      },
      {
        "locale": "hu-HU",
        "displayName": "Magyar (Hungary)",
        "startWeekday": 1
      },
      {
        "locale": "el-GR",
        "displayName": "\u0395\u03bb\u03bb\u03b7\u03bd\u03b9\u03ba\u03ac (Greece)",
        "startWeekday": 1
      },
      {
        "locale": "ms-MY",
        "displayName": "Bahasa Melayu (Malaysia)",
        "startWeekday": 1
      },
      {
        "locale": "vi-VN",
        "displayName": "Ti\u1ebfng Vi\u1ec7t (Vietnam)",
        "startWeekday": 1
      },
      {
        "locale": "id-ID",
        "displayName": "Bahasa Indonesia (Indonesia)",
        "startWeekday": 0
      },
    ]
  },
  {
    "name": "chinese",
    "displayName": "Chinese",
    "locales": [
      {
        "locale": "zh-CN",
        "displayName": "\u4e2d\u6587 (China)",
        "startWeekday": 0
      },
      {
        "locale": "zh-TW",
        "displayName": "\u4e2d\u6587 (Taiwan)",
        "startWeekday": 0
      },
      {
        "locale": "en-US",
        "displayName": "English (United States)",
        "startWeekday": 0
      }
    ]
  },
  {
    "name": "hebrew",
    "displayName": "Hebrew",
    "locales": [
      {
        "locale": "he-IL",
        "displayName": "\u05e2\u05d1\u05e8\u05d9\u05ea (Israel)",
        "startWeekday": 0
      },
      {
        "locale": "en-US",
        "displayName": "English (United States)",
        "startWeekday": 0
      }
    ]
  },
  {
    "name": "islamic",
    "displayName": "Islamic",
    "locales": [
      {
        "locale": "ar-SA",
        "displayName": "\u0627\u0644\u0639\u0631\u0628\u064a\u0629 (Saudi Arabia)",
        "startWeekday": 0
      },
      {
        "locale": "ar-EG",
        "displayName": "\u0627\u0644\u0639\u0631\u0628\u064a\u0629 (Egypt)",
        "startWeekday": 6
      },
      {
        "locale": "ur-PK",
        "displayName": "اردو (Pakistan)",
        "startWeekday": 0
      },
      {
        "locale": "en-US",
        "displayName": "English (United States)",
        "startWeekday": 0
      }
    ]
  },
  {
    "name": "japanese",
    "displayName": "Japanese",
    "locales": [
      {
        "locale": "ja-JP",
        "displayName": "\u65e5\u672c\u8a9e (Japan)",
        "startWeekday": 0
      },
      {
        "locale": "en-US",
        "displayName": "English (United States)",
        "startWeekday": 0
      }
    ]
  },
  {
    "name": "indian",
    "displayName": "Indian",
    "locales": [
      {
        "locale": "hi-IN",
        "displayName": "\u0939\u093f\u0928\u094d\u0926\u0940 (India)",
        "startWeekday": 0
      },
      {
        "locale": "en-US",
        "displayName": "English (United States)",
        "startWeekday": 0
      }
    ]
  },
  {
    "name": "persian",
    "displayName": "Persian",
    "locales": [
      {
        "locale": "fa-IR",
        "displayName": "\u0641\u0627\u0631\u0633\u06cc (Iran)",
        "startWeekday": 6
      },
      {
        "locale": "en-US",
        "displayName": "English (United States)",
        "startWeekday": 6
      }
    ]
  },
  {
    "name": "iso8601",
    "displayName": "ISO 8601", //Gregorian (ISO 8601 - always starts at Monday)
    "locales": [
      {
        "locale": "en-US",
        "displayName": "English (United States)",
        "startWeekday": 1
      },
      {
        "locale": "en-GB",
        "displayName": "English (United Kingdom)",
        "startWeekday": 1
      },
      {
        "locale": "de-DE",
        "displayName": "Deutsch (Germany)",
        "startWeekday": 1
      },
      {
        "locale": "fr-FR",
        "displayName": "Fran\u00e7ais (France)",
        "startWeekday": 1
      },
      {
        "locale": "sv-SE",
        "displayName": "Svenska (Sweden)",
        "startWeekday": 1
      },
      {
        "locale": "fi-FI",
        "displayName": "Suomi (Finland)",
        "startWeekday": 1
      }
    ]
  },
  {
    "name": "buddhist",
    "displayName": "Buddhist",
    "locales": [
      {
        "locale": "th-TH",
        "displayName": "\u0e44\u0e17\u0e22 (Thailand)",
        "startWeekday": 0
      },
      {
        "locale": "en-US",
        "displayName": "English (United States)",
        "startWeekday": 0
      }
    ]
  },
  {
    "name": "roc",
    "displayName": "Roc",
    "locales": [
      {
        "locale": "zh-TW",
        "displayName": "\u4e2d\u6587 (Taiwan)",
        "startWeekday": 0
      },
      {
        "locale": "en-US",
        "displayName": "English (United States)",
        "startWeekday": 0
      }
    ]
  },
  {
    "name": "coptic",
    "displayName": "Coptic",
    "locales": [
      {
        "locale": "ar-EG",
        "displayName": "\u0627\u0644\u0639\u0631\u0628\u064a\u0629 (Egypt)",
        "startWeekday": 6
      },
      {
        "locale": "en-US",
        "displayName": "English (United States)",
        "startWeekday": 6
      }
    ]
  },
  {
    "name": "ethiopic",
    "displayName": "Ethiopic",
    "locales": [
      {
        "locale": "am-ET",
        "displayName": "\u12a0\u121b\u122d\u129b (Ethiopia)",
        "startWeekday": 0
      },
      {
        "locale": "en-US",
        "displayName": "English (United States)",
        "startWeekday": 0
      }
    ]
  },
  {
    "name": "ethiopia",
    "displayName": "Ethiopia",
    "locales": [
      {
        "locale": "am-ET",
        "displayName": "\u12a0\u121b\u122d\u129b (Ethiopia)",
        "startWeekday": 0
      },
      {
        "locale": "en-US",
        "displayName": "English (United States)",
        "startWeekday": 0
      }
    ]
  }
];
