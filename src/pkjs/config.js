module.exports = [
  { 
    "type": "heading", 
    "defaultValue": "Diderot Settings" 
  },
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
  },
  {
    "type": "submit",
    "defaultValue": "Save"
  }
];