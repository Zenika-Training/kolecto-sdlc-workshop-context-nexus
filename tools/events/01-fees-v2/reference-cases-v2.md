# Reference cases · payment reminders

> Owned by the programme (facilitation). These are the business's acceptance examples: the reference tests of the three
> starters run them against your code. **Do not edit**: if a case looks wrong, raise it with the Head of Receivables.
> Each case gives the exact input and the exact expected output. Dates are `YYYY-MM-DD`; instants are ISO 8601 with the Paris offset.

> **Changed in 2.0.0** (decision of the Head of Receivables, see `business-rules.md` RR-05): fees now apply from the **firm** step, and the decision lists them separately in `fees: [{ kind, amountMinor }]` instead of a single `feeMinor`. Squad B’s plans list one fee line per kind, and squad C reports the fees by kind (RR-13).

## How the reference tests use this file

- `decideReminder` cases → squad A's `decideReminder(input)` must return `expected` (deep equality).
- `planReminder` cases → squad B's `planReminder(input)` must return `expected` (deep equality).
- `measurePilot` cases → squad C's `measurePilot(input)` must return `expected` (deep equality). Their `plans` are squad B's plans, built from squad A's decisions.

## Cases

```json
{
  "version": "2.0.0",
  "decideReminder": [
    {
      "name": "friendly step, exactly 3 days overdue (boundary)",
      "input": {
        "invoice": {
          "id": "inv_0012",
          "number": "F-2026-0012",
          "customerId": "C06",
          "issueDate": "2026-10-18",
          "dueDate": "2026-11-17",
          "totalMinor": 54000,
          "currency": "EUR",
          "disputed": false
        },
        "payments": [],
        "customer": {
          "id": "C06",
          "name": "Maison Verdier Architectes",
          "type": "B2B",
          "language": "fr",
          "optedOut": false,
          "email": "accounts+c06@example.test"
        },
        "today": "2026-11-20"
      },
      "expected": {
        "invoiceId": "inv_0012",
        "invoiceNumber": "F-2026-0012",
        "customerId": "C06",
        "eligible": true,
        "reason": null,
        "daysOverdue": 3,
        "outstandingMinor": 54000,
        "currency": "EUR",
        "step": "friendly",
        "fees": []
      }
    },
    {
      "name": "friendly step, English customer",
      "input": {
        "invoice": {
          "id": "inv_0025",
          "number": "F-2026-0025",
          "customerId": "C05",
          "issueDate": "2026-10-09",
          "dueDate": "2026-11-08",
          "totalMinor": 39000,
          "currency": "EUR",
          "disputed": false
        },
        "payments": [],
        "customer": {
          "id": "C05",
          "name": "Brightline Logistics",
          "type": "B2B",
          "language": "en",
          "optedOut": false,
          "email": "accounts+c05@example.test"
        },
        "today": "2026-11-20"
      },
      "expected": {
        "invoiceId": "inv_0025",
        "invoiceNumber": "F-2026-0025",
        "customerId": "C05",
        "eligible": true,
        "reason": null,
        "daysOverdue": 12,
        "outstandingMinor": 39000,
        "currency": "EUR",
        "step": "friendly",
        "fees": []
      }
    },
    {
      "name": "firm step",
      "input": {
        "invoice": {
          "id": "inv_0002",
          "number": "F-2026-0002",
          "customerId": "C01",
          "issueDate": "2026-10-01",
          "dueDate": "2026-10-31",
          "totalMinor": 45600,
          "currency": "EUR",
          "disputed": false
        },
        "payments": [],
        "customer": {
          "id": "C01",
          "name": "Atelier Lumen SARL",
          "type": "B2B",
          "language": "fr",
          "optedOut": false,
          "email": "accounts+c01@example.test"
        },
        "today": "2026-11-20"
      },
      "expected": {
        "invoiceId": "inv_0002",
        "invoiceNumber": "F-2026-0002",
        "customerId": "C01",
        "eligible": true,
        "reason": null,
        "daysOverdue": 20,
        "outstandingMinor": 45600,
        "currency": "EUR",
        "step": "firm",
        "fees": [
          {
            "kind": "indemnity",
            "amountMinor": 4000
          },
          {
            "kind": "interest",
            "amountMinor": 250
          }
        ]
      }
    },
    {
      "name": "firm step, English customer",
      "input": {
        "invoice": {
          "id": "inv_0006",
          "number": "F-2026-0006",
          "customerId": "C03",
          "issueDate": "2026-10-05",
          "dueDate": "2026-11-04",
          "totalMinor": 99000,
          "currency": "EUR",
          "disputed": false
        },
        "payments": [],
        "customer": {
          "id": "C03",
          "name": "Northwind Consulting",
          "type": "B2B",
          "language": "en",
          "optedOut": false,
          "email": "accounts+c03@example.test"
        },
        "today": "2026-11-20"
      },
      "expected": {
        "invoiceId": "inv_0006",
        "invoiceNumber": "F-2026-0006",
        "customerId": "C03",
        "eligible": true,
        "reason": null,
        "daysOverdue": 16,
        "outstandingMinor": 99000,
        "currency": "EUR",
        "step": "firm",
        "fees": [
          {
            "kind": "indemnity",
            "amountMinor": 4000
          },
          {
            "kind": "interest",
            "amountMinor": 434
          }
        ]
      }
    },
    {
      "name": "formal step, fees include indemnity and interest",
      "input": {
        "invoice": {
          "id": "inv_0005",
          "number": "F-2026-0005",
          "customerId": "C03",
          "issueDate": "2026-09-01",
          "dueDate": "2026-10-01",
          "totalMinor": 250000,
          "currency": "EUR",
          "disputed": false
        },
        "payments": [
          {
            "id": "pay_0003",
            "invoiceId": "inv_0005",
            "date": "2026-10-12",
            "amountMinor": 100000
          }
        ],
        "customer": {
          "id": "C03",
          "name": "Northwind Consulting",
          "type": "B2B",
          "language": "en",
          "optedOut": false,
          "email": "accounts+c03@example.test"
        },
        "today": "2026-11-20"
      },
      "expected": {
        "invoiceId": "inv_0005",
        "invoiceNumber": "F-2026-0005",
        "customerId": "C03",
        "eligible": true,
        "reason": null,
        "daysOverdue": 50,
        "outstandingMinor": 150000,
        "currency": "EUR",
        "step": "formal",
        "fees": [
          {
            "kind": "indemnity",
            "amountMinor": 4000
          },
          {
            "kind": "interest",
            "amountMinor": 2055
          }
        ]
      }
    },
    {
      "name": "formal step after a partial payment",
      "input": {
        "invoice": {
          "id": "inv_0027",
          "number": "F-2026-0027",
          "customerId": "C07",
          "issueDate": "2026-09-12",
          "dueDate": "2026-10-12",
          "totalMinor": 47500,
          "currency": "EUR",
          "disputed": false
        },
        "payments": [
          {
            "id": "pay_0009",
            "invoiceId": "inv_0027",
            "date": "2026-11-19",
            "amountMinor": 20000
          }
        ],
        "customer": {
          "id": "C07",
          "name": "Pixel Harbour Ltd",
          "type": "B2B",
          "language": "en",
          "optedOut": false,
          "email": "accounts+c07@example.test"
        },
        "today": "2026-11-20"
      },
      "expected": {
        "invoiceId": "inv_0027",
        "invoiceNumber": "F-2026-0027",
        "customerId": "C07",
        "eligible": true,
        "reason": null,
        "daysOverdue": 39,
        "outstandingMinor": 27500,
        "currency": "EUR",
        "step": "formal",
        "fees": [
          {
            "kind": "indemnity",
            "amountMinor": 4000
          },
          {
            "kind": "interest",
            "amountMinor": 294
          }
        ]
      }
    },
    {
      "name": "formal step, a payment dated after today is ignored",
      "input": {
        "invoice": {
          "id": "inv_0032",
          "number": "F-2026-0032",
          "customerId": "C04",
          "issueDate": "2026-09-06",
          "dueDate": "2026-10-06",
          "totalMinor": 64000,
          "currency": "EUR",
          "disputed": false
        },
        "payments": [
          {
            "id": "pay_0011",
            "invoiceId": "inv_0032",
            "date": "2026-11-25",
            "amountMinor": 64000
          }
        ],
        "customer": {
          "id": "C04",
          "name": "Studio Ardoise",
          "type": "B2B",
          "language": "fr",
          "optedOut": false,
          "email": "accounts+c04@example.test"
        },
        "today": "2026-11-20"
      },
      "expected": {
        "invoiceId": "inv_0032",
        "invoiceNumber": "F-2026-0032",
        "customerId": "C04",
        "eligible": true,
        "reason": null,
        "daysOverdue": 45,
        "outstandingMinor": 64000,
        "currency": "EUR",
        "step": "formal",
        "fees": [
          {
            "kind": "indemnity",
            "amountMinor": 4000
          },
          {
            "kind": "interest",
            "amountMinor": 789
          }
        ]
      }
    },
    {
      "name": "formal step, long overdue with two partial payments",
      "input": {
        "invoice": {
          "id": "inv_0038",
          "number": "F-2026-0038",
          "customerId": "C10",
          "issueDate": "2026-08-15",
          "dueDate": "2026-09-14",
          "totalMinor": 260000,
          "currency": "EUR",
          "disputed": false
        },
        "payments": [
          {
            "id": "pay_0013",
            "invoiceId": "inv_0038",
            "date": "2026-10-10",
            "amountMinor": 100000
          },
          {
            "id": "pay_0014",
            "invoiceId": "inv_0038",
            "date": "2026-11-02",
            "amountMinor": 60000
          }
        ],
        "customer": {
          "id": "C10",
          "name": "Helios Data Labs",
          "type": "B2B",
          "language": "en",
          "optedOut": false,
          "email": "accounts+c10@example.test"
        },
        "today": "2026-11-20"
      },
      "expected": {
        "invoiceId": "inv_0038",
        "invoiceNumber": "F-2026-0038",
        "customerId": "C10",
        "eligible": true,
        "reason": null,
        "daysOverdue": 67,
        "outstandingMinor": 100000,
        "currency": "EUR",
        "step": "formal",
        "fees": [
          {
            "kind": "indemnity",
            "amountMinor": 4000
          },
          {
            "kind": "interest",
            "amountMinor": 1836
          }
        ]
      }
    },
    {
      "name": "not eligible: fully paid",
      "input": {
        "invoice": {
          "id": "inv_0011",
          "number": "F-2026-0011",
          "customerId": "C06",
          "issueDate": "2026-09-25",
          "dueDate": "2026-10-25",
          "totalMinor": 186000,
          "currency": "EUR",
          "disputed": false
        },
        "payments": [
          {
            "id": "pay_0005",
            "invoiceId": "inv_0011",
            "date": "2026-11-05",
            "amountMinor": 186000
          }
        ],
        "customer": {
          "id": "C06",
          "name": "Maison Verdier Architectes",
          "type": "B2B",
          "language": "fr",
          "optedOut": false,
          "email": "accounts+c06@example.test"
        },
        "today": "2026-11-20"
      },
      "expected": {
        "invoiceId": "inv_0011",
        "invoiceNumber": "F-2026-0011",
        "customerId": "C06",
        "eligible": false,
        "reason": "PAID",
        "daysOverdue": 26,
        "outstandingMinor": 0,
        "currency": "EUR",
        "step": null,
        "fees": []
      }
    },
    {
      "name": "not eligible: not overdue yet",
      "input": {
        "invoice": {
          "id": "inv_0008",
          "number": "F-2026-0008",
          "customerId": "C04",
          "issueDate": "2026-10-25",
          "dueDate": "2026-11-24",
          "totalMinor": 30000,
          "currency": "EUR",
          "disputed": false
        },
        "payments": [],
        "customer": {
          "id": "C04",
          "name": "Studio Ardoise",
          "type": "B2B",
          "language": "fr",
          "optedOut": false,
          "email": "accounts+c04@example.test"
        },
        "today": "2026-11-20"
      },
      "expected": {
        "invoiceId": "inv_0008",
        "invoiceNumber": "F-2026-0008",
        "customerId": "C04",
        "eligible": false,
        "reason": "NOT_OVERDUE",
        "daysOverdue": 0,
        "outstandingMinor": 30000,
        "currency": "EUR",
        "step": null,
        "fees": []
      }
    },
    {
      "name": "not eligible: B2C customer",
      "input": {
        "invoice": {
          "id": "inv_0021",
          "number": "F-2026-0021",
          "customerId": "C11",
          "issueDate": "2026-10-01",
          "dueDate": "2026-10-31",
          "totalMinor": 9900,
          "currency": "EUR",
          "disputed": false
        },
        "payments": [],
        "customer": {
          "id": "C11",
          "name": "Private customer 11",
          "type": "B2C",
          "language": "fr",
          "optedOut": false,
          "email": "accounts+c11@example.test"
        },
        "today": "2026-11-20"
      },
      "expected": {
        "invoiceId": "inv_0021",
        "invoiceNumber": "F-2026-0021",
        "customerId": "C11",
        "eligible": false,
        "reason": "NOT_B2B",
        "daysOverdue": 20,
        "outstandingMinor": 9900,
        "currency": "EUR",
        "step": null,
        "fees": []
      }
    },
    {
      "name": "not eligible: disputed invoice",
      "input": {
        "invoice": {
          "id": "inv_0010",
          "number": "F-2026-0010",
          "customerId": "C05",
          "issueDate": "2026-10-15",
          "dueDate": "2026-11-14",
          "totalMinor": 72000,
          "currency": "EUR",
          "disputed": true
        },
        "payments": [],
        "customer": {
          "id": "C05",
          "name": "Brightline Logistics",
          "type": "B2B",
          "language": "en",
          "optedOut": false,
          "email": "accounts+c05@example.test"
        },
        "today": "2026-11-20"
      },
      "expected": {
        "invoiceId": "inv_0010",
        "invoiceNumber": "F-2026-0010",
        "customerId": "C05",
        "eligible": false,
        "reason": "DISPUTED",
        "daysOverdue": 6,
        "outstandingMinor": 72000,
        "currency": "EUR",
        "step": null,
        "fees": []
      }
    },
    {
      "name": "not eligible: customer opted out",
      "input": {
        "invoice": {
          "id": "inv_0022",
          "number": "F-2026-0022",
          "customerId": "C12",
          "issueDate": "2026-09-20",
          "dueDate": "2026-10-20",
          "totalMinor": 140000,
          "currency": "EUR",
          "disputed": false
        },
        "payments": [],
        "customer": {
          "id": "C12",
          "name": "Quietwater Events",
          "type": "B2B",
          "language": "en",
          "optedOut": true,
          "email": "accounts+c12@example.test"
        },
        "today": "2026-11-20"
      },
      "expected": {
        "invoiceId": "inv_0022",
        "invoiceNumber": "F-2026-0022",
        "customerId": "C12",
        "eligible": false,
        "reason": "OPTED_OUT",
        "daysOverdue": 31,
        "outstandingMinor": 140000,
        "currency": "EUR",
        "step": null,
        "fees": []
      }
    },
    {
      "name": "not eligible: outstanding below €10",
      "input": {
        "invoice": {
          "id": "inv_0013",
          "number": "F-2026-0013",
          "customerId": "C07",
          "issueDate": "2026-10-03",
          "dueDate": "2026-11-02",
          "totalMinor": 31200,
          "currency": "EUR",
          "disputed": false
        },
        "payments": [
          {
            "id": "pay_0006",
            "invoiceId": "inv_0013",
            "date": "2026-11-10",
            "amountMinor": 31000
          }
        ],
        "customer": {
          "id": "C07",
          "name": "Pixel Harbour Ltd",
          "type": "B2B",
          "language": "en",
          "optedOut": false,
          "email": "accounts+c07@example.test"
        },
        "today": "2026-11-20"
      },
      "expected": {
        "invoiceId": "inv_0013",
        "invoiceNumber": "F-2026-0013",
        "customerId": "C07",
        "eligible": false,
        "reason": "BELOW_THRESHOLD",
        "daysOverdue": 18,
        "outstandingMinor": 200,
        "currency": "EUR",
        "step": null,
        "fees": []
      }
    },
    {
      "name": "not eligible: only 1 day overdue",
      "input": {
        "invoice": {
          "id": "inv_0004",
          "number": "F-2026-0004",
          "customerId": "C02",
          "issueDate": "2026-10-20",
          "dueDate": "2026-11-19",
          "totalMinor": 23400,
          "currency": "EUR",
          "disputed": false
        },
        "payments": [],
        "customer": {
          "id": "C02",
          "name": "Cerise & Co Bakery",
          "type": "B2B",
          "language": "fr",
          "optedOut": false,
          "email": "accounts+c02@example.test"
        },
        "today": "2026-11-20"
      },
      "expected": {
        "invoiceId": "inv_0004",
        "invoiceNumber": "F-2026-0004",
        "customerId": "C02",
        "eligible": false,
        "reason": "TOO_EARLY",
        "daysOverdue": 1,
        "outstandingMinor": 23400,
        "currency": "EUR",
        "step": null,
        "fees": []
      }
    }
  ],
  "planReminder": [
    {
      "name": "firm, inside the sending window: send now",
      "input": {
        "decision": {
          "invoiceId": "inv_0002",
          "invoiceNumber": "F-2026-0002",
          "customerId": "C01",
          "eligible": true,
          "reason": null,
          "daysOverdue": 20,
          "outstandingMinor": 45600,
          "currency": "EUR",
          "step": "firm",
          "fees": [
            {
              "kind": "indemnity",
              "amountMinor": 4000
            },
            {
              "kind": "interest",
              "amountMinor": 250
            }
          ]
        },
        "customer": {
          "id": "C01",
          "name": "Atelier Lumen SARL",
          "type": "B2B",
          "language": "fr",
          "optedOut": false,
          "email": "accounts+c01@example.test"
        },
        "now": "2026-11-20T10:15:00+01:00"
      },
      "expected": {
        "invoiceId": "inv_0002",
        "send": true,
        "channel": "email",
        "to": "accounts+c01@example.test",
        "sendAt": "2026-11-20T10:15:00+01:00",
        "template": "firm-fr",
        "subject": "Deuxième relance : la facture F-2026-0002 est en retard de 20 jours",
        "feeLines": [
          {
            "label": "Fixed recovery indemnity",
            "amountMinor": 4000
          },
          {
            "label": "Late-payment interest",
            "amountMinor": 250
          }
        ],
        "amountDueMinor": 49850,
        "currency": "EUR",
        "event": {
          "name": "reminder_scheduled",
          "invoiceId": "inv_0002",
          "step": "firm",
          "sendAt": "2026-11-20T10:15:00+01:00"
        }
      }
    },
    {
      "name": "friendly, French template, exactly 09:00",
      "input": {
        "decision": {
          "invoiceId": "inv_0012",
          "invoiceNumber": "F-2026-0012",
          "customerId": "C06",
          "eligible": true,
          "reason": null,
          "daysOverdue": 3,
          "outstandingMinor": 54000,
          "currency": "EUR",
          "step": "friendly",
          "fees": []
        },
        "customer": {
          "id": "C06",
          "name": "Maison Verdier Architectes",
          "type": "B2B",
          "language": "fr",
          "optedOut": false,
          "email": "accounts+c06@example.test"
        },
        "now": "2026-11-20T09:00:00+01:00"
      },
      "expected": {
        "invoiceId": "inv_0012",
        "send": true,
        "channel": "email",
        "to": "accounts+c06@example.test",
        "sendAt": "2026-11-20T09:00:00+01:00",
        "template": "friendly-fr",
        "subject": "Petit rappel : la facture F-2026-0012 est en retard de 3 jours",
        "feeLines": [],
        "amountDueMinor": 54000,
        "currency": "EUR",
        "event": {
          "name": "reminder_scheduled",
          "invoiceId": "inv_0012",
          "step": "friendly",
          "sendAt": "2026-11-20T09:00:00+01:00"
        }
      }
    },
    {
      "name": "after 18:00 on Friday: next Monday 09:00",
      "input": {
        "decision": {
          "invoiceId": "inv_0006",
          "invoiceNumber": "F-2026-0006",
          "customerId": "C03",
          "eligible": true,
          "reason": null,
          "daysOverdue": 16,
          "outstandingMinor": 99000,
          "currency": "EUR",
          "step": "firm",
          "fees": [
            {
              "kind": "indemnity",
              "amountMinor": 4000
            },
            {
              "kind": "interest",
              "amountMinor": 434
            }
          ]
        },
        "customer": {
          "id": "C03",
          "name": "Northwind Consulting",
          "type": "B2B",
          "language": "en",
          "optedOut": false,
          "email": "accounts+c03@example.test"
        },
        "now": "2026-11-20T18:30:00+01:00"
      },
      "expected": {
        "invoiceId": "inv_0006",
        "send": true,
        "channel": "email",
        "to": "accounts+c03@example.test",
        "sendAt": "2026-11-23T09:00:00+01:00",
        "template": "firm-en",
        "subject": "Second reminder: invoice F-2026-0006 is 16 days overdue",
        "feeLines": [
          {
            "label": "Fixed recovery indemnity",
            "amountMinor": 4000
          },
          {
            "label": "Late-payment interest",
            "amountMinor": 434
          }
        ],
        "amountDueMinor": 103434,
        "currency": "EUR",
        "event": {
          "name": "reminder_scheduled",
          "invoiceId": "inv_0006",
          "step": "firm",
          "sendAt": "2026-11-23T09:00:00+01:00"
        }
      }
    },
    {
      "name": "Saturday: next Monday 09:00",
      "input": {
        "decision": {
          "invoiceId": "inv_0027",
          "invoiceNumber": "F-2026-0027",
          "customerId": "C07",
          "eligible": true,
          "reason": null,
          "daysOverdue": 39,
          "outstandingMinor": 27500,
          "currency": "EUR",
          "step": "formal",
          "fees": [
            {
              "kind": "indemnity",
              "amountMinor": 4000
            },
            {
              "kind": "interest",
              "amountMinor": 294
            }
          ]
        },
        "customer": {
          "id": "C07",
          "name": "Pixel Harbour Ltd",
          "type": "B2B",
          "language": "en",
          "optedOut": false,
          "email": "accounts+c07@example.test"
        },
        "now": "2026-11-21T11:00:00+01:00"
      },
      "expected": {
        "invoiceId": "inv_0027",
        "send": true,
        "channel": "email",
        "to": "accounts+c07@example.test",
        "sendAt": "2026-11-23T09:00:00+01:00",
        "template": "formal-en",
        "subject": "Formal notice: invoice F-2026-0027 is 39 days overdue",
        "feeLines": [
          {
            "label": "Fixed recovery indemnity",
            "amountMinor": 4000
          },
          {
            "label": "Late-payment interest",
            "amountMinor": 294
          }
        ],
        "amountDueMinor": 31794,
        "currency": "EUR",
        "event": {
          "name": "reminder_scheduled",
          "invoiceId": "inv_0027",
          "step": "formal",
          "sendAt": "2026-11-23T09:00:00+01:00"
        }
      }
    },
    {
      "name": "early morning: same day 09:00",
      "input": {
        "decision": {
          "invoiceId": "inv_0005",
          "invoiceNumber": "F-2026-0005",
          "customerId": "C03",
          "eligible": true,
          "reason": null,
          "daysOverdue": 50,
          "outstandingMinor": 150000,
          "currency": "EUR",
          "step": "formal",
          "fees": [
            {
              "kind": "indemnity",
              "amountMinor": 4000
            },
            {
              "kind": "interest",
              "amountMinor": 2055
            }
          ]
        },
        "customer": {
          "id": "C03",
          "name": "Northwind Consulting",
          "type": "B2B",
          "language": "en",
          "optedOut": false,
          "email": "accounts+c03@example.test"
        },
        "now": "2026-11-20T07:45:00+01:00"
      },
      "expected": {
        "invoiceId": "inv_0005",
        "send": true,
        "channel": "email",
        "to": "accounts+c03@example.test",
        "sendAt": "2026-11-20T09:00:00+01:00",
        "template": "formal-en",
        "subject": "Formal notice: invoice F-2026-0005 is 50 days overdue",
        "feeLines": [
          {
            "label": "Fixed recovery indemnity",
            "amountMinor": 4000
          },
          {
            "label": "Late-payment interest",
            "amountMinor": 2055
          }
        ],
        "amountDueMinor": 156055,
        "currency": "EUR",
        "event": {
          "name": "reminder_scheduled",
          "invoiceId": "inv_0005",
          "step": "formal",
          "sendAt": "2026-11-20T09:00:00+01:00"
        }
      }
    },
    {
      "name": "day before a public holiday, after hours: skip the holiday",
      "input": {
        "decision": {
          "invoiceId": "inv_0038",
          "invoiceNumber": "F-2026-0038",
          "customerId": "C10",
          "eligible": true,
          "reason": null,
          "daysOverdue": 67,
          "outstandingMinor": 100000,
          "currency": "EUR",
          "step": "formal",
          "fees": [
            {
              "kind": "indemnity",
              "amountMinor": 4000
            },
            {
              "kind": "interest",
              "amountMinor": 1836
            }
          ]
        },
        "customer": {
          "id": "C10",
          "name": "Helios Data Labs",
          "type": "B2B",
          "language": "en",
          "optedOut": false,
          "email": "accounts+c10@example.test"
        },
        "now": "2026-12-24T19:00:00+01:00"
      },
      "expected": {
        "invoiceId": "inv_0038",
        "send": true,
        "channel": "email",
        "to": "accounts+c10@example.test",
        "sendAt": "2026-12-28T09:00:00+01:00",
        "template": "formal-en",
        "subject": "Formal notice: invoice F-2026-0038 is 67 days overdue",
        "feeLines": [
          {
            "label": "Fixed recovery indemnity",
            "amountMinor": 4000
          },
          {
            "label": "Late-payment interest",
            "amountMinor": 1836
          }
        ],
        "amountDueMinor": 105836,
        "currency": "EUR",
        "event": {
          "name": "reminder_scheduled",
          "invoiceId": "inv_0038",
          "step": "formal",
          "sendAt": "2026-12-28T09:00:00+01:00"
        }
      }
    },
    {
      "name": "formal notice, English customer",
      "input": {
        "decision": {
          "invoiceId": "inv_0019",
          "invoiceNumber": "F-2026-0019",
          "customerId": "C10",
          "eligible": true,
          "reason": null,
          "daysOverdue": 46,
          "outstandingMinor": 180000,
          "currency": "EUR",
          "step": "formal",
          "fees": [
            {
              "kind": "indemnity",
              "amountMinor": 4000
            },
            {
              "kind": "interest",
              "amountMinor": 2268
            }
          ]
        },
        "customer": {
          "id": "C10",
          "name": "Helios Data Labs",
          "type": "B2B",
          "language": "en",
          "optedOut": false,
          "email": "accounts+c10@example.test"
        },
        "now": "2026-11-20T14:00:00+01:00"
      },
      "expected": {
        "invoiceId": "inv_0019",
        "send": true,
        "channel": "email",
        "to": "accounts+c10@example.test",
        "sendAt": "2026-11-20T14:00:00+01:00",
        "template": "formal-en",
        "subject": "Formal notice: invoice F-2026-0019 is 46 days overdue",
        "feeLines": [
          {
            "label": "Fixed recovery indemnity",
            "amountMinor": 4000
          },
          {
            "label": "Late-payment interest",
            "amountMinor": 2268
          }
        ],
        "amountDueMinor": 186268,
        "currency": "EUR",
        "event": {
          "name": "reminder_scheduled",
          "invoiceId": "inv_0019",
          "step": "formal",
          "sendAt": "2026-11-20T14:00:00+01:00"
        }
      }
    },
    {
      "name": "not eligible: nothing to send",
      "input": {
        "decision": {
          "invoiceId": "inv_0022",
          "invoiceNumber": "F-2026-0022",
          "customerId": "C12",
          "eligible": false,
          "reason": "OPTED_OUT",
          "daysOverdue": 31,
          "outstandingMinor": 140000,
          "currency": "EUR",
          "step": null,
          "fees": []
        },
        "customer": {
          "id": "C12",
          "name": "Quietwater Events",
          "type": "B2B",
          "language": "en",
          "optedOut": true,
          "email": "accounts+c12@example.test"
        },
        "now": "2026-11-20T10:00:00+01:00"
      },
      "expected": {
        "invoiceId": "inv_0022",
        "send": false,
        "reason": "OPTED_OUT"
      }
    }
  ],
  "measurePilot": [
    {
      "name": "one formal reminder, paid 5 days later",
      "input": {
        "plans": [
          {
            "invoiceId": "inv_0005",
            "send": true,
            "channel": "email",
            "to": "accounts+c03@example.test",
            "sendAt": "2026-11-16T10:00:00+01:00",
            "template": "formal-en",
            "subject": "Formal notice: invoice F-2026-0005 is 46 days overdue",
            "feeLines": [
              {
                "label": "Fixed recovery indemnity",
                "amountMinor": 4000
              },
              {
                "label": "Late-payment interest",
                "amountMinor": 1890
              }
            ],
            "amountDueMinor": 155890,
            "currency": "EUR",
            "event": {
              "name": "reminder_scheduled",
              "invoiceId": "inv_0005",
              "step": "formal",
              "sendAt": "2026-11-16T10:00:00+01:00"
            }
          }
        ],
        "invoices": [
          {
            "id": "inv_0005",
            "number": "F-2026-0005",
            "customerId": "C03",
            "issueDate": "2026-09-01",
            "dueDate": "2026-10-01",
            "totalMinor": 250000,
            "currency": "EUR",
            "disputed": false
          }
        ],
        "payments": [
          {
            "id": "pay_0003",
            "invoiceId": "inv_0005",
            "date": "2026-10-12",
            "amountMinor": 100000
          },
          {
            "id": "pay_p001",
            "invoiceId": "inv_0005",
            "date": "2026-11-21",
            "amountMinor": 150000
          }
        ],
        "from": "2026-11-01",
        "to": "2026-11-30"
      },
      "expected": {
        "from": "2026-11-01",
        "to": "2026-11-30",
        "remindedInvoices": 1,
        "byStep": {
          "friendly": 0,
          "firm": 0,
          "formal": 1
        },
        "paidWithin7DaysPercent": 100,
        "averagePaymentDelayDays": 51,
        "feesScheduled": {
          "indemnityMinor": 4000,
          "interestMinor": 1890,
          "totalMinor": 5890
        },
        "currency": "EUR"
      }
    },
    {
      "name": "a payment on day 7 counts, on day 8 it does not",
      "input": {
        "plans": [
          {
            "invoiceId": "inv_0002",
            "send": true,
            "channel": "email",
            "to": "accounts+c01@example.test",
            "sendAt": "2026-11-16T10:00:00+01:00",
            "template": "firm-fr",
            "subject": "Deuxième relance : la facture F-2026-0002 est en retard de 16 jours",
            "feeLines": [
              {
                "label": "Fixed recovery indemnity",
                "amountMinor": 4000
              },
              {
                "label": "Late-payment interest",
                "amountMinor": 200
              }
            ],
            "amountDueMinor": 49800,
            "currency": "EUR",
            "event": {
              "name": "reminder_scheduled",
              "invoiceId": "inv_0002",
              "step": "firm",
              "sendAt": "2026-11-16T10:00:00+01:00"
            }
          },
          {
            "invoiceId": "inv_0006",
            "send": true,
            "channel": "email",
            "to": "accounts+c03@example.test",
            "sendAt": "2026-11-16T10:00:00+01:00",
            "template": "friendly-en",
            "subject": "Friendly reminder: invoice F-2026-0006 is 12 days overdue",
            "feeLines": [],
            "amountDueMinor": 99000,
            "currency": "EUR",
            "event": {
              "name": "reminder_scheduled",
              "invoiceId": "inv_0006",
              "step": "friendly",
              "sendAt": "2026-11-16T10:00:00+01:00"
            }
          }
        ],
        "invoices": [
          {
            "id": "inv_0002",
            "number": "F-2026-0002",
            "customerId": "C01",
            "issueDate": "2026-10-01",
            "dueDate": "2026-10-31",
            "totalMinor": 45600,
            "currency": "EUR",
            "disputed": false
          },
          {
            "id": "inv_0006",
            "number": "F-2026-0006",
            "customerId": "C03",
            "issueDate": "2026-10-05",
            "dueDate": "2026-11-04",
            "totalMinor": 99000,
            "currency": "EUR",
            "disputed": false
          }
        ],
        "payments": [
          {
            "id": "pay_p001",
            "invoiceId": "inv_0002",
            "date": "2026-11-23",
            "amountMinor": 45600
          },
          {
            "id": "pay_p002",
            "invoiceId": "inv_0006",
            "date": "2026-11-24",
            "amountMinor": 99000
          }
        ],
        "from": "2026-11-16",
        "to": "2026-11-30"
      },
      "expected": {
        "from": "2026-11-16",
        "to": "2026-11-30",
        "remindedInvoices": 2,
        "byStep": {
          "friendly": 1,
          "firm": 1,
          "formal": 0
        },
        "paidWithin7DaysPercent": 50,
        "averagePaymentDelayDays": 21.5,
        "feesScheduled": {
          "indemnityMinor": 4000,
          "interestMinor": 200,
          "totalMinor": 4200
        },
        "currency": "EUR"
      }
    },
    {
      "name": "an invoice reminded twice counts once, from its first reminder",
      "input": {
        "plans": [
          {
            "invoiceId": "inv_0012",
            "send": true,
            "channel": "email",
            "to": "accounts+c06@example.test",
            "sendAt": "2026-11-20T10:00:00+01:00",
            "template": "friendly-fr",
            "subject": "Petit rappel : la facture F-2026-0012 est en retard de 3 jours",
            "feeLines": [],
            "amountDueMinor": 54000,
            "currency": "EUR",
            "event": {
              "name": "reminder_scheduled",
              "invoiceId": "inv_0012",
              "step": "friendly",
              "sendAt": "2026-11-20T10:00:00+01:00"
            }
          },
          {
            "invoiceId": "inv_0012",
            "send": true,
            "channel": "email",
            "to": "accounts+c06@example.test",
            "sendAt": "2026-12-07T10:00:00+01:00",
            "template": "firm-fr",
            "subject": "Deuxième relance : la facture F-2026-0012 est en retard de 20 jours",
            "feeLines": [
              {
                "label": "Fixed recovery indemnity",
                "amountMinor": 4000
              },
              {
                "label": "Late-payment interest",
                "amountMinor": 296
              }
            ],
            "amountDueMinor": 58296,
            "currency": "EUR",
            "event": {
              "name": "reminder_scheduled",
              "invoiceId": "inv_0012",
              "step": "firm",
              "sendAt": "2026-12-07T10:00:00+01:00"
            }
          }
        ],
        "invoices": [
          {
            "id": "inv_0012",
            "number": "F-2026-0012",
            "customerId": "C06",
            "issueDate": "2026-10-18",
            "dueDate": "2026-11-17",
            "totalMinor": 54000,
            "currency": "EUR",
            "disputed": false
          }
        ],
        "payments": [],
        "from": "2026-11-01",
        "to": "2026-12-31"
      },
      "expected": {
        "from": "2026-11-01",
        "to": "2026-12-31",
        "remindedInvoices": 1,
        "byStep": {
          "friendly": 1,
          "firm": 0,
          "formal": 0
        },
        "paidWithin7DaysPercent": 0,
        "averagePaymentDelayDays": null,
        "feesScheduled": {
          "indemnityMinor": 4000,
          "interestMinor": 296,
          "totalMinor": 4296
        },
        "currency": "EUR"
      }
    },
    {
      "name": "a reminder outside the period is ignored",
      "input": {
        "plans": [
          {
            "invoiceId": "inv_0019",
            "send": true,
            "channel": "email",
            "to": "accounts+c10@example.test",
            "sendAt": "2026-11-02T10:00:00+01:00",
            "template": "firm-en",
            "subject": "Second reminder: invoice F-2026-0019 is 28 days overdue",
            "feeLines": [
              {
                "label": "Fixed recovery indemnity",
                "amountMinor": 4000
              },
              {
                "label": "Late-payment interest",
                "amountMinor": 1381
              }
            ],
            "amountDueMinor": 185381,
            "currency": "EUR",
            "event": {
              "name": "reminder_scheduled",
              "invoiceId": "inv_0019",
              "step": "firm",
              "sendAt": "2026-11-02T10:00:00+01:00"
            }
          },
          {
            "invoiceId": "inv_0025",
            "send": true,
            "channel": "email",
            "to": "accounts+c05@example.test",
            "sendAt": "2026-11-16T10:00:00+01:00",
            "template": "friendly-en",
            "subject": "Friendly reminder: invoice F-2026-0025 is 8 days overdue",
            "feeLines": [],
            "amountDueMinor": 39000,
            "currency": "EUR",
            "event": {
              "name": "reminder_scheduled",
              "invoiceId": "inv_0025",
              "step": "friendly",
              "sendAt": "2026-11-16T10:00:00+01:00"
            }
          }
        ],
        "invoices": [
          {
            "id": "inv_0019",
            "number": "F-2026-0019",
            "customerId": "C10",
            "issueDate": "2026-09-05",
            "dueDate": "2026-10-05",
            "totalMinor": 330000,
            "currency": "EUR",
            "disputed": false
          },
          {
            "id": "inv_0025",
            "number": "F-2026-0025",
            "customerId": "C05",
            "issueDate": "2026-10-09",
            "dueDate": "2026-11-08",
            "totalMinor": 39000,
            "currency": "EUR",
            "disputed": false
          }
        ],
        "payments": [
          {
            "id": "pay_0007",
            "invoiceId": "inv_0019",
            "date": "2026-10-30",
            "amountMinor": 150000
          }
        ],
        "from": "2026-11-03",
        "to": "2026-11-30"
      },
      "expected": {
        "from": "2026-11-03",
        "to": "2026-11-30",
        "remindedInvoices": 1,
        "byStep": {
          "friendly": 1,
          "firm": 0,
          "formal": 0
        },
        "paidWithin7DaysPercent": 0,
        "averagePaymentDelayDays": null,
        "feesScheduled": {
          "indemnityMinor": 0,
          "interestMinor": 0,
          "totalMinor": 0
        },
        "currency": "EUR"
      }
    },
    {
      "name": "nothing sent in the period: nothing to measure",
      "input": {
        "plans": [
          {
            "invoiceId": "inv_0022",
            "send": false,
            "reason": "OPTED_OUT"
          },
          {
            "invoiceId": "inv_0013",
            "send": false,
            "reason": "BELOW_THRESHOLD"
          }
        ],
        "invoices": [
          {
            "id": "inv_0022",
            "number": "F-2026-0022",
            "customerId": "C12",
            "issueDate": "2026-09-20",
            "dueDate": "2026-10-20",
            "totalMinor": 140000,
            "currency": "EUR",
            "disputed": false
          },
          {
            "id": "inv_0013",
            "number": "F-2026-0013",
            "customerId": "C07",
            "issueDate": "2026-10-03",
            "dueDate": "2026-11-02",
            "totalMinor": 31200,
            "currency": "EUR",
            "disputed": false
          }
        ],
        "payments": [
          {
            "id": "pay_0006",
            "invoiceId": "inv_0013",
            "date": "2026-11-10",
            "amountMinor": 31000
          }
        ],
        "from": "2026-11-01",
        "to": "2026-11-30"
      },
      "expected": {
        "from": "2026-11-01",
        "to": "2026-11-30",
        "remindedInvoices": 0,
        "byStep": {
          "friendly": 0,
          "firm": 0,
          "formal": 0
        },
        "paidWithin7DaysPercent": null,
        "averagePaymentDelayDays": null,
        "feesScheduled": {
          "indemnityMinor": 0,
          "interestMinor": 0,
          "totalMinor": 0
        },
        "currency": "EUR"
      }
    },
    {
      "name": "the pilot so far: every step, a partial payment, a late payment",
      "input": {
        "plans": [
          {
            "invoiceId": "inv_0012",
            "send": true,
            "channel": "email",
            "to": "accounts+c06@example.test",
            "sendAt": "2026-11-20T10:00:00+01:00",
            "template": "friendly-fr",
            "subject": "Petit rappel : la facture F-2026-0012 est en retard de 3 jours",
            "feeLines": [],
            "amountDueMinor": 54000,
            "currency": "EUR",
            "event": {
              "name": "reminder_scheduled",
              "invoiceId": "inv_0012",
              "step": "friendly",
              "sendAt": "2026-11-20T10:00:00+01:00"
            }
          },
          {
            "invoiceId": "inv_0002",
            "send": true,
            "channel": "email",
            "to": "accounts+c01@example.test",
            "sendAt": "2026-11-16T10:00:00+01:00",
            "template": "firm-fr",
            "subject": "Deuxième relance : la facture F-2026-0002 est en retard de 16 jours",
            "feeLines": [
              {
                "label": "Fixed recovery indemnity",
                "amountMinor": 4000
              },
              {
                "label": "Late-payment interest",
                "amountMinor": 200
              }
            ],
            "amountDueMinor": 49800,
            "currency": "EUR",
            "event": {
              "name": "reminder_scheduled",
              "invoiceId": "inv_0002",
              "step": "firm",
              "sendAt": "2026-11-16T10:00:00+01:00"
            }
          },
          {
            "invoiceId": "inv_0027",
            "send": true,
            "channel": "email",
            "to": "accounts+c07@example.test",
            "sendAt": "2026-11-16T10:00:00+01:00",
            "template": "formal-en",
            "subject": "Formal notice: invoice F-2026-0027 is 35 days overdue",
            "feeLines": [
              {
                "label": "Fixed recovery indemnity",
                "amountMinor": 4000
              },
              {
                "label": "Late-payment interest",
                "amountMinor": 455
              }
            ],
            "amountDueMinor": 51955,
            "currency": "EUR",
            "event": {
              "name": "reminder_scheduled",
              "invoiceId": "inv_0027",
              "step": "formal",
              "sendAt": "2026-11-16T10:00:00+01:00"
            }
          },
          {
            "invoiceId": "inv_0038",
            "send": true,
            "channel": "email",
            "to": "accounts+c10@example.test",
            "sendAt": "2026-11-16T10:00:00+01:00",
            "template": "formal-en",
            "subject": "Formal notice: invoice F-2026-0038 is 63 days overdue",
            "feeLines": [
              {
                "label": "Fixed recovery indemnity",
                "amountMinor": 4000
              },
              {
                "label": "Late-payment interest",
                "amountMinor": 1726
              }
            ],
            "amountDueMinor": 105726,
            "currency": "EUR",
            "event": {
              "name": "reminder_scheduled",
              "invoiceId": "inv_0038",
              "step": "formal",
              "sendAt": "2026-11-16T10:00:00+01:00"
            }
          },
          {
            "invoiceId": "inv_0020",
            "send": true,
            "channel": "email",
            "to": "accounts+c10@example.test",
            "sendAt": "2026-11-16T10:00:00+01:00",
            "template": "friendly-en",
            "subject": "Friendly reminder: invoice F-2026-0020 is 3 days overdue",
            "feeLines": [],
            "amountDueMinor": 66000,
            "currency": "EUR",
            "event": {
              "name": "reminder_scheduled",
              "invoiceId": "inv_0020",
              "step": "friendly",
              "sendAt": "2026-11-16T10:00:00+01:00"
            }
          }
        ],
        "invoices": [
          {
            "id": "inv_0012",
            "number": "F-2026-0012",
            "customerId": "C06",
            "issueDate": "2026-10-18",
            "dueDate": "2026-11-17",
            "totalMinor": 54000,
            "currency": "EUR",
            "disputed": false
          },
          {
            "id": "inv_0002",
            "number": "F-2026-0002",
            "customerId": "C01",
            "issueDate": "2026-10-01",
            "dueDate": "2026-10-31",
            "totalMinor": 45600,
            "currency": "EUR",
            "disputed": false
          },
          {
            "id": "inv_0027",
            "number": "F-2026-0027",
            "customerId": "C07",
            "issueDate": "2026-09-12",
            "dueDate": "2026-10-12",
            "totalMinor": 47500,
            "currency": "EUR",
            "disputed": false
          },
          {
            "id": "inv_0038",
            "number": "F-2026-0038",
            "customerId": "C10",
            "issueDate": "2026-08-15",
            "dueDate": "2026-09-14",
            "totalMinor": 260000,
            "currency": "EUR",
            "disputed": false
          },
          {
            "id": "inv_0020",
            "number": "F-2026-0020",
            "customerId": "C10",
            "issueDate": "2026-10-14",
            "dueDate": "2026-11-13",
            "totalMinor": 66000,
            "currency": "EUR",
            "disputed": false
          }
        ],
        "payments": [
          {
            "id": "pay_0009",
            "invoiceId": "inv_0027",
            "date": "2026-11-19",
            "amountMinor": 20000
          },
          {
            "id": "pay_0013",
            "invoiceId": "inv_0038",
            "date": "2026-10-10",
            "amountMinor": 100000
          },
          {
            "id": "pay_0014",
            "invoiceId": "inv_0038",
            "date": "2026-11-02",
            "amountMinor": 60000
          },
          {
            "id": "pay_p001",
            "invoiceId": "inv_0020",
            "date": "2026-11-30",
            "amountMinor": 66000
          }
        ],
        "from": "2026-11-01",
        "to": "2026-11-30"
      },
      "expected": {
        "from": "2026-11-01",
        "to": "2026-11-30",
        "remindedInvoices": 5,
        "byStep": {
          "friendly": 2,
          "firm": 1,
          "formal": 2
        },
        "paidWithin7DaysPercent": 20,
        "averagePaymentDelayDays": 17,
        "feesScheduled": {
          "indemnityMinor": 12000,
          "interestMinor": 2381,
          "totalMinor": 14381
        },
        "currency": "EUR"
      }
    }
  ]
}
```
