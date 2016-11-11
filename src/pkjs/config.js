module.exports = [
  { 
    "type": "heading", 
    "defaultValue": "Diderot Settings"
  },
  {
    "type": "section",
    "items": [
      {
        "type": "radiogroup",
        "messageKey": "UNITS",
        "label": "Units",
        "defaultValue": 'km',
        "options": [
          { 
            "label": "Kilometers", 
            "value": "km" 
          },
          { 
            "label": "Miles", 
            "value": "mile" 
          }
        ]
      }
    ]
  },
  {
    "type": "section",
    "items": [
      {
        "type": "color",
        "messageKey": "TIME_COLOR",
        "defaultValue": "ff0000",
        "label": "Time Color",
        "sunlight": true
      },
    ]
  },
  {
    "type": "section",
    "items": [
      {
        "type": "select",
        "messageKey": "WIKI",
        "label": "Wikipedia language",
        "defaultValue": 'en',
        "options": [
          { 
            "label": "English", 
            "value": "en" 
          },
          { 
            "label": "Deutch", 
            "value": "de" 
          },
          { 
            "label": "français", 
            "value": "fr" 
          },
          { 
            "label": "español", 
            "value": "es" 
          },
          { 
            "label": "русский", 
            "value": "ru" 
          },
          { 
            "label": "italiano", 
            "value": "it" 
          },
          { 
            "label": "日本語", 
            "value": "ja" 
          },
          { 
            "label": "Nederlands", 
            "value": "nl" 
          },
          { 
            "label": "português", 
            "value": "pt" 
          },
          { 
            "label": "polski", 
            "value": "pl" 
          },
          { 
            "label": "中文", 
            "value": "zh" 
          },
          { 
            "label": "svenska", 
            "value": "sv" 
          },
          { 
            "label": "srpskohrvatski / српскохрватски", 
            "value": "sh" 
          },
          { 
            "label": "Tiếng Việt", 
            "value": "vi" 
          },
          { 
            "label": "العربية", 
            "value": "ar" 
          },
          { 
            "label": "فارسی", 
            "value": "fa" 
          },
          { 
            "label": "עברית", 
            "value": "he" 
          },
          { 
            "label": "한국어", 
            "value": "ko" 
          },
          { 
            "label": "українська", 
            "value": "uk" 
          },
          { 
            "label": "magyar", 
            "value": "hu" 
          },
          { 
            "label": "Türkçe", 
            "value": "tr" 
          },
          { 
            "label": "català", 
            "value": "ca" 
          },
          { 
            "label": "suomi", 
            "value": "fi" 
          },
          { 
            "label": "norsk bokmål", 
            "value": "no" 
          },
          {
            "label": "čeština",
            "value": "cs"
          }
        ]
      }
    ]
  },
  {
    "type": "submit",
    "defaultValue": "Save"
  }
];