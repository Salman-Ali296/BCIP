"""Generate a deterministic, fully synthetic multilingual complaint dataset.

No real customer messages or personal data are used. Each incident has two
variants. Incident-grouped splits prevent paraphrase leakage.
"""
from __future__ import annotations

import argparse
import json
import random
import re
from collections import Counter
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split

SEED = 42
SECTORS = ["retail", "food_service", "logistics", "healthcare", "education"]
CATEGORIES = [
    "billing", "delivery", "product_quality", "customer_service",
    "technical_issue", "refund_return",
]
LANGUAGES = ["english", "urdu", "roman_urdu"]
PRIORITIES = ["low", "medium", "high", "critical"]
SENTIMENTS = ["neutral", "negative", "mixed"]
CHANNELS = ["website", "whatsapp", "email", "social_media"]

TERMS = {
    "english": {
        "retail": ("my online order", "sales representative", "store portal"),
        "food_service": ("my meal order", "restaurant manager", "ordering app"),
        "logistics": ("my parcel", "courier agent", "tracking portal"),
        "healthcare": ("my medicine and lab-request order", "clinic receptionist", "patient portal"),
        "education": ("my course-material package", "student support officer", "student portal"),
    },
    "urdu": {
        "retail": ("میرے آن لائن آرڈر", "سیلز نمائندے", "اسٹور پورٹل"),
        "food_service": ("میرے کھانے کے آرڈر", "ریسٹورنٹ منیجر", "آرڈرنگ ایپ"),
        "logistics": ("میرے پارسل", "کورئیر نمائندے", "ٹریکنگ پورٹل"),
        "healthcare": ("میری دوا اور لیب رپورٹ کے آرڈر", "کلینک ریسپشنسٹ", "مریض پورٹل"),
        "education": ("میرے کورس میٹیرئل کے پیکج", "اسٹوڈنٹ سپورٹ افسر", "اسٹوڈنٹ پورٹل"),
    },
    "roman_urdu": {
        "retail": ("mere online order", "sales representative", "store portal"),
        "food_service": ("mere khane ke order", "restaurant manager", "ordering app"),
        "logistics": ("mere parcel", "courier agent", "tracking portal"),
        "healthcare": ("meri dawa aur lab request ke order", "clinic receptionist", "patient portal"),
        "education": ("mere course material ke package", "student support officer", "student portal"),
    },
}

ISSUES = {
    "english": {
        "billing": [
            "I was charged {amount} PKR for {item}, although the confirmed bill was different.",
            "My bill for {item} contains an unexplained extra charge of {amount} PKR.",
        ],
        "delivery": [
            "{item_cap} was due {delay_days} days ago, but I have not received it yet.",
            "The delivery of {item} is now {delay_days} days late and the status has not changed.",
        ],
        "product_quality": [
            "{item_cap} arrived damaged and does not match the description.",
            "The quality of {item} is poor; an essential part was missing when it arrived.",
        ],
        "customer_service": [
            "The {staff} spoke rudely and refused to help with {item}.",
            "I contacted the {staff} about {item}, but my concern was dismissed without a proper check.",
        ],
        "technical_issue": [
            "The {system} shows an error whenever I try to access {item}.",
            "I cannot use the {system} to manage {item}; it repeatedly freezes after login.",
        ],
        "refund_return": [
            "My return request for {item} was accepted, but the {amount} PKR refund is still pending.",
            "I returned {item} as instructed and have not received the promised {amount} PKR refund.",
        ],
    },
    "urdu": {
        "billing": [
            "{item} کے لیے مجھ سے {amount} روپے وصول کیے گئے ہیں، جبکہ تصدیق شدہ بل کی رقم مختلف تھی۔",
            "{item} کے بل میں {amount} روپے کا اضافی چارج شامل ہے جس کی کوئی وضاحت نہیں دی گئی۔",
        ],
        "delivery": [
            "{item} کی فراہمی {delay_days} دن قبل متوقع تھی، لیکن ابھی تک مجھے کچھ نہیں ملا۔",
            "{item} کی ڈیلیوری میں {delay_days} دن کی تاخیر ہو چکی ہے اور اسٹیٹس بھی نہیں بدلا۔",
        ],
        "product_quality": [
            "{item} خراب حالت میں ملا اور یہ بیان کردہ تفصیل سے مطابقت نہیں رکھتا۔",
            "{item} کا معیار بہت کمزور ہے اور موصول ہونے پر اس کا ایک ضروری حصہ بھی غائب تھا۔",
        ],
        "customer_service": [
            "{staff} نے بدتمیزی سے بات کی اور {item} کے مسئلے میں مدد سے انکار کر دیا۔",
            "میں نے {item} کے بارے میں {staff} سے رابطہ کیا، لیکن میری شکایت کو بغیر جانچے نظرانداز کر دیا گیا۔",
        ],
        "technical_issue": [
            "جب بھی میں {item} تک رسائی حاصل کرتا ہوں تو {system} میں خرابی ظاہر ہوتی ہے۔",
            "میں {item} کے لیے {system} استعمال نہیں کر سکتا؛ لاگ اِن کے بعد یہ بار بار جام ہو جاتا ہے۔",
        ],
        "refund_return": [
            "{item} کی واپسی قبول کر لی گئی تھی، لیکن {amount} روپے کی رقم ابھی تک واپس نہیں ملی۔",
            "میں نے ہدایت کے مطابق {item} واپس کیا، لیکن وعدہ کی گئی {amount} روپے کی رقم نہیں ملی۔",
        ],
    },
    "roman_urdu": {
        "billing": [
            "{item} ke liye mujh se {amount} PKR liye gaye hain, jab ke confirm bill ki amount mukhtalif thi.",
            "{item} ke bill mein {amount} PKR ka extra charge hai jis ki koi wazahat nahi di gayi.",
        ],
        "delivery": [
            "{item} {delay_days} din pehle mil jana chahiye tha, lekin ab tak receive nahi hua.",
            "{item} ki delivery mein {delay_days} din ki delay ho chuki hai aur status bhi update nahi hua.",
        ],
        "product_quality": [
            "{item} damaged condition mein mila aur description se bilkul match nahi karta.",
            "{item} ki quality bohat kharab hai aur receive hone par us ka aik zaroori hissa bhi missing tha.",
        ],
        "customer_service": [
            "{staff} ne badtameezi se baat ki aur {item} ke masle mein madad se inkaar kar diya.",
            "Main ne {item} ke bare mein {staff} se contact kiya, lekin meri complaint baghair check kiye ignore kar di gayi.",
        ],
        "technical_issue": [
            "Jab bhi main {item} access karta hoon, {system} error show karta hai.",
            "Main {item} ke liye {system} use nahi kar sakta; login ke baad yeh bar bar freeze ho jata hai.",
        ],
        "refund_return": [
            "{item} ki return request accept ho gayi thi, lekin {amount} PKR ka refund ab tak pending hai.",
            "Main ne instructions ke mutabiq {item} return kiya, lekin promised {amount} PKR refund nahi mila.",
        ],
    },
}

OPENERS = {
    "english": {
        "neutral": ["I would like to report an issue.", "Please register the following complaint.", "I need assistance with a recent transaction."],
        "negative": ["I am extremely frustrated with this service.", "This experience has been very disappointing.", "I am upset about the way this has been handled."],
        "mixed": ["Your staff was polite earlier, but I am disappointed now.", "I usually like your service, but this incident is concerning.", "The initial support was helpful, although the main issue remains."],
    },
    "urdu": {
        "neutral": ["میں ایک مسئلہ رپورٹ کرنا چاہتا ہوں۔", "براہ کرم درج ذیل شکایت درج کی جائے۔", "مجھے اپنی حالیہ ٹرانزیکشن کے بارے میں مدد چاہیے۔"],
        "negative": ["میں اس سروس سے انتہائی مایوس ہوں۔", "یہ تجربہ انتہائی مایوس کن رہا ہے۔", "اس معاملے کو سنبھالنے کے طریقے پر مجھے سخت ناراضگی ہے۔"],
        "mixed": ["آپ کا عملہ پہلے شائستہ تھا، لیکن اب میں مایوس ہوں۔", "عام طور پر مجھے آپ کی سروس پسند ہے، لیکن یہ واقعہ تشویزناک ہے۔", "ابتدائی مدد اچھی تھی، اگرچہ اصل مسئلہ اب بھی باقی ہے۔"],
    },
    "roman_urdu": {
        "neutral": ["Main aik masla report karna chahta hoon.", "Barah-e-karam neeche di gayi complaint register ki jaye.", "Mujhe apni recent transaction ke bare mein madad chahiye."],
        "negative": ["Main is service se bohat frustrated hoon.", "Yeh experience bohat disappointing raha hai.", "Is maamle ko handle karne ke tareeqe par main bohat naraz hoon."],
        "mixed": ["Aap ka staff pehle polite tha, lekin ab main disappointed hoon.", "Aam tor par mujhe aap ki service pasand hai, lekin yeh waqia worrying hai.", "Initial support achhi thi, magar asal masla ab bhi baqi hai."],
    },
}

CLOSERS = {
    "english": {
        "neutral": ["Please investigate and confirm the next step.", "Kindly review this and provide a resolution update."],
        "negative": ["This is unacceptable; resolve it without further excuses.", "I need a concrete resolution, not another generic apology."],
        "mixed": ["I appreciate the earlier help, but this still needs a fair resolution.", "Please preserve the good service standard by fixing this promptly."],
    },
    "urdu": {
        "neutral": ["براہ کرم تحقیق کر کے اگلا قدم واضح کریں۔", "براہ مہربانی اس کا جائزہ لے کر حل کے بارے میں آگاہ کریں۔"],
        "negative": ["یہ ناقابل قبول ہے؛ مزید جواز کے بغیر اسے حل کیا جائے۔", "مجھے عمومی معافی نہیں، مسئلے کا واضح حل چاہیے۔"],
        "mixed": ["پہلی مدد کا شکریہ، لیکن اس مسئلے کا منصفانہ حل اب بھی درکار ہے۔", "براہ کرم اسے جلد حل کر کے اپنی اچھی سروس برقرار رکھیں۔"],
    },
    "roman_urdu": {
        "neutral": ["Barah-e-karam investigate kar ke next step confirm karein.", "Meherbani kar ke is ka review karein aur resolution update dein."],
        "negative": ["Yeh unacceptable hai; mazeed excuses ke baghair isey resolve karein.", "Mujhe generic apology nahi, masle ka clear solution chahiye."],
        "mixed": ["Pehli madad ka shukriya, lekin is ka fair resolution ab bhi chahiye.", "Barah-e-karam isey jaldi fix kar ke apni achhi service maintain karein."],
    },
}

PRIORITY_CUES = {
    "english": {
        "low": ["This is a minor inconvenience and there is no urgent deadline.", "The issue is limited and does not affect safety or an essential service."],
        "medium": ["This has been pending for {delay_days} days and is disrupting my routine.", "The delay is causing a moderate inconvenience and needs a scheduled resolution."],
        "high": ["I have reported this {repeat_count} times; it remains unresolved and is causing a significant loss.", "This affects an important commitment today and previous follow-ups have not helped.", "The unresolved issue is preventing me from using a service I already paid for."],
        "critical": ["There is an immediate safety risk and someone could be harmed if action is not taken now.", "This involves an unauthorized payment and possible ongoing misuse of my account.", "An essential service is completely unavailable to several customers right now.", "This may require urgent legal or regulatory reporting because of the potential harm involved."],
    },
    "urdu": {
        "low": ["یہ ایک معمولی تکلیف ہے اور کوئی فوری آخری تاریخ نہیں ہے۔", "مسئلہ محدود ہے اور اس سے حفاظت یا کسی ضروری سروس پر اثر نہیں پڑ رہا۔"],
        "medium": ["یہ معاملہ {delay_days} دن سے زیر التوا ہے اور میری روزمرہ روٹین متاثر ہو رہی ہے۔", "اس تاخیر سے درمیانی تکلیف ہو رہی ہے اور مقررہ وقت میں حل درکار ہے۔"],
        "high": ["میں اس کی شکایت {repeat_count} بار کر چکا ہوں؛ مسئلہ حل نہیں ہوا اور نمایاں نقصان ہو رہا ہے۔", "یہ آج کی ایک اہم ذمہ داری کو متاثر کر رہا ہے اور پچھلی فالو اپ سے کوئی فائدہ نہیں ہوا۔", "حل نہ ہونے کی وجہ سے میں وہ سروس استعمال نہیں کر سکتا جس کی ادائیگی کر چکا ہوں۔"],
        "critical": ["فوری حفاظتی خطرہ موجود ہے اور فوری اقدام نہ ہونے پر کسی کو نقصان پہنچ سکتا ہے۔", "اس میں غیر مجاز ادائیگی اور میرے اکاؤنٹ کے ممکنہ مسلسل غلط استعمال کا خطرہ شامل ہے۔", "اس وقت ایک ضروری سروس متعدد گاہکوں کے لیے مکمل طور پر بند ہے۔", "ممکنہ نقصان کی وجہ سے اس معاملے کی فوری قانونی یا ریگولیٹری رپورٹنگ درکار ہو سکتی ہے۔"],
    },
    "roman_urdu": {
        "low": ["Yeh aik minor inconvenience hai aur koi urgent deadline nahi hai.", "Masla limited hai aur is se safety ya koi essential service affect nahi ho rahi."],
        "medium": ["Yeh maamla {delay_days} din se pending hai aur meri daily routine disrupt ho rahi hai.", "Is delay se moderate inconvenience ho rahi hai aur scheduled resolution chahiye."],
        "high": ["Main is ki complaint {repeat_count} dafa kar chuka hoon; masla resolve nahi hua aur significant loss ho raha hai.", "Yeh aaj ki aik important commitment affect kar raha hai aur pichle follow-ups se madad nahi mili.", "Unresolved masle ki wajah se main woh service use nahi kar sakta jis ki payment kar chuka hoon."],
        "critical": ["Immediate safety risk hai aur action na lene par kisi ko nuqsan ho sakta hai.", "Is mein unauthorized payment aur mere account ke possible ongoing misuse ka risk shamil hai.", "Is waqt aik essential service kai customers ke liye bilkul unavailable hai.", "Possible harm ki wajah se is ki urgent legal ya regulatory reporting ki zaroorat ho sakti hai."],
    },
}

PRIORITY_RATIONALES = {
    "low": "Minor inconvenience; no stated safety, financial-account, essential-service, or deadline risk.",
    "medium": "Ongoing delay or moderate disruption without a critical risk indicator.",
    "high": "Repeated unresolved contact, significant loss, paid-service blockage, or same-day commitment.",
    "critical": "Immediate safety, unauthorized-payment, essential-service outage, or legal/regulatory risk.",
}
SENTIMENT_RATIONALES = {
    "neutral": "Predominantly factual request without a strong emotional evaluation.",
    "negative": "Explicit frustration, disappointment, anger, or dissatisfaction.",
    "mixed": "Contains both appreciation and dissatisfaction about the same experience.",
}


def shuffled_labels(labels: list[str], n: int, rng: random.Random) -> list[str]:
    base = (labels * (n // len(labels) + 1))[:n]
    rng.shuffle(base)
    return base


def apply_surface_noise(text: str, language: str, variant: int) -> str:
    """Deterministic, light spelling variation; never alters references or labels."""
    replacements = {
        "english": [("receive", "recieve"), ("refund", "refnd"), ("delivery", "delivry"), ("resolved", "resolvd")],
        "roman_urdu": [("nahi", "nhi"), ("bohat", "bohut"), ("kiya", "kia"), ("refund", "refnd"), ("receive", "recieve")],
        "urdu": [],
    }[language]
    for index, (source, target) in enumerate(replacements):
        if index % 2 == variant % 2:
            text = re.sub(rf"\b{re.escape(source)}\b", target, text, flags=re.IGNORECASE)
    return text


def generate(n_incidents: int = 3000) -> tuple[pd.DataFrame, pd.DataFrame]:
    if n_incidents % 30 != 0:
        raise ValueError("n_incidents must be divisible by 30 for balanced generation")
    rng = random.Random(SEED)
    sentiments = shuffled_labels(["negative"] * 11 + ["neutral"] * 5 + ["mixed"] * 4, n_incidents, rng)
    priorities = shuffled_labels(["low"] * 4 + ["medium"] * 6 + ["high"] * 6 + ["critical"] * 4, n_incidents, rng)
    language_pairs = [
        ("english", "english"), ("urdu", "urdu"),
        ("roman_urdu", "roman_urdu"), ("english", "urdu"),
        ("english", "roman_urdu"), ("urdu", "roman_urdu"),
    ]

    incidents = []
    for i in range(n_incidents):
        incidents.append({
            "incident_index": i,
            "incident_id": f"INC-{i:06d}",
            "sector": SECTORS[i % len(SECTORS)],
            "category": CATEGORIES[(i // len(SECTORS)) % len(CATEGORIES)],
            "secondary_category": CATEGORIES[((i // len(SECTORS)) + 1 + (i % 5)) % len(CATEGORIES)] if i % 4 == 0 else "",
            "difficulty": "easy" if i % 20 < 12 else ("noisy" if i % 20 < 17 else "implicit"),
            "sentiment": sentiments[i],
            "priority": priorities[i],
            "languages": language_pairs[i % len(language_pairs)],
            "order_ref": f"PK-{100000 + i}",
            "include_ref": i % 10 < 7,
            "amount": int(rng.randrange(500, 50001, 100)),
            "delay_days": int(rng.randint(2, 30)),
            "repeat_count": int(rng.randint(2, 6)),
            "channel": CHANNELS[i % len(CHANNELS)],
        })

    # Split incidents, never individual paraphrase variants.
    train_ids, temp_ids = train_test_split(
        incidents, test_size=0.30, random_state=SEED,
        stratify=[x["category"] for x in incidents],
    )
    val_ids, test_ids = train_test_split(
        temp_ids, test_size=0.50, random_state=SEED,
        stratify=[x["category"] for x in temp_ids],
    )
    split_by_incident = {}
    for split, rows in (("train", train_ids), ("val", val_ids), ("test", test_ids)):
        for row in rows:
            split_by_incident[row["incident_id"]] = split

    complaints = []
    seen_texts = set()
    for incident in incidents:
        i = incident["incident_index"]
        for variant, language in enumerate(incident["languages"]):
            item, staff, system = TERMS[language][incident["sector"]]
            values = {
                "item": item, "item_cap": item[0].upper() + item[1:],
                "staff": staff, "system": system,
                "amount": incident["amount"], "delay_days": incident["delay_days"],
                "repeat_count": incident["repeat_count"],
            }
            # Implicit examples use a factual opening; emotion must be inferred
            # from the remaining wording rather than a stock emotional opener.
            opener_sentiment = "neutral" if incident["difficulty"] == "implicit" else incident["sentiment"]
            opener_list = OPENERS[language][opener_sentiment]
            closer_list = CLOSERS[language][incident["sentiment"]]
            cue_list = PRIORITY_CUES[language][incident["priority"]]
            opener = opener_list[(i + variant) % len(opener_list)]
            issue = ISSUES[language][incident["category"]][variant % 2].format(**values)
            cue = cue_list[(i + variant) % len(cue_list)].format(**values)
            closer = closer_list[(i + variant) % len(closer_list)]
            secondary = ""
            if incident["secondary_category"]:
                secondary_issue = ISSUES[language][incident["secondary_category"]][(variant + 1) % 2].format(**values)
                prefix = {
                    "english": "Separately, I also want to mention: ",
                    "urdu": "اس کے علاوہ ایک اور معمولی مسئلہ بھی درج کرنا ہے: ",
                    "roman_urdu": "Is ke ilawa aik aur minor issue bhi register karna hai: ",
                }[language]
                secondary = prefix + secondary_issue
            ref_text = ""
            if incident["include_ref"]:
                ref_text = {
                    "english": f" Reference: {incident['order_ref']}.",
                    "urdu": f" حوالہ نمبر: {incident['order_ref']}۔",
                    "roman_urdu": f" Reference number: {incident['order_ref']}.",
                }[language]
            # The first reported issue is the primary category; a later issue is
            # explicitly secondary. Variant order differs for surface variation.
            def compose_text(salt: int = 0) -> str:
                selected_opener = opener_list[(i + variant + salt) % len(opener_list)]
                selected_cue = cue_list[(i + variant + salt // 3) % len(cue_list)]
                selected_closer = closer_list[(i + variant + salt // 6) % len(closer_list)]
                selected_issue = ISSUES[language][incident["category"]][(variant + salt // 12) % 2].format(**values)
                parts = ([selected_opener, selected_issue, secondary, selected_cue, selected_closer] if variant == 0 else [selected_issue, selected_opener, secondary, selected_cue, selected_closer])
                value = re.sub(r"\s+", " ", " ".join(x for x in parts if x) + ref_text).strip()
                if incident["difficulty"] == "noisy":
                    value = apply_surface_noise(value, language, variant)
                return value

            text = compose_text()
            salt = 0
            while text in seen_texts:
                salt += 1
                if salt > 30:
                    raise RuntimeError(f"Could not de-duplicate incident {incident['incident_id']}")
                text = compose_text(salt)
            seen_texts.add(text)
            complaints.append({
                "complaint_id": f"CMP-{2*i + variant:06d}",
                "incident_id": incident["incident_id"],
                "variant": variant,
                "text": text,
                "language": language,
                "sector": incident["sector"],
                "category": incident["category"],
                "secondary_category": incident["secondary_category"],
                "difficulty": incident["difficulty"],
                "sentiment": incident["sentiment"],
                "priority": incident["priority"],
                "channel": incident["channel"],
                "order_ref": incident["order_ref"],
                "reference_in_text": incident["include_ref"],
                "amount_pkr": incident["amount"],
                "delay_days": incident["delay_days"],
                "repeat_count": incident["repeat_count"],
                "split": split_by_incident[incident["incident_id"]],
                "sentiment_rationale": SENTIMENT_RATIONALES[incident["sentiment"]],
                "priority_rationale": PRIORITY_RATIONALES[incident["priority"]],
                "is_synthetic": True,
                "generation_seed": SEED,
            })

    complaints_df = pd.DataFrame(complaints).sort_values("complaint_id").reset_index(drop=True)
    by_incident = {x["incident_id"]: x for x in incidents}
    by_split = {s: [x["incident_id"] for x in incidents if split_by_incident[x["incident_id"]] == s] for s in ["train", "val", "test"]}
    complaint_lookup = {(r.incident_id, int(r.variant)): r for r in complaints_df.itertuples()}

    pairs = []
    pair_counter = 0
    for split, incident_ids in by_split.items():
        split_incidents = [by_incident[x] for x in incident_ids]
        for pos, incident in enumerate(split_incidents):
            a = complaint_lookup[(incident["incident_id"], 0)]
            b = complaint_lookup[(incident["incident_id"], 1)]
            pairs.append({
                "pair_id": f"PAIR-{pair_counter:06d}", "split": split, "label": 1,
                "left_complaint_id": a.complaint_id, "right_complaint_id": b.complaint_id,
                "left_text": a.text, "right_text": b.text,
                "left_incident_id": a.incident_id, "right_incident_id": b.incident_id,
                "pair_type": "positive_paraphrase",
                "language_relation": "same" if a.language == b.language else "cross",
                "shared_order_ref": bool(a.reference_in_text and b.reference_in_text),
            })
            pair_counter += 1

            # One negative per incident: 80% hard (same sector/category), 20% easy.
            if pos % 5 == 0:
                candidates = [x for x in split_incidents if x["category"] != incident["category"]]
                other = candidates[(pos * 7 + 3) % len(candidates)]
                pair_type = "easy_negative"
            else:
                candidates = [x for x in split_incidents if x["sector"] == incident["sector"] and x["category"] == incident["category"] and x["incident_id"] != incident["incident_id"]]
                other = candidates[(pos * 7 + 1) % len(candidates)]
                pair_type = "hard_negative"
            c = complaint_lookup[(other["incident_id"], 1)]
            pairs.append({
                "pair_id": f"PAIR-{pair_counter:06d}", "split": split, "label": 0,
                "left_complaint_id": a.complaint_id, "right_complaint_id": c.complaint_id,
                "left_text": a.text, "right_text": c.text,
                "left_incident_id": a.incident_id, "right_incident_id": c.incident_id,
                "pair_type": pair_type,
                "language_relation": "same" if a.language == c.language else "cross",
                "shared_order_ref": False,
            })
            pair_counter += 1

    pairs_df = pd.DataFrame(pairs)
    pairs_df = pairs_df.sample(frac=1, random_state=SEED).reset_index(drop=True)
    return complaints_df, pairs_df


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, default=Path(__file__).resolve().parents[1] / "data")
    parser.add_argument("--incidents", type=int, default=3000)
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    complaints, pairs = generate(args.incidents)
    complaints.to_csv(args.output / "complaints.csv", index=False)
    pairs.to_csv(args.output / "duplicate_pairs.csv", index=False)

    review = complaints.groupby("category", group_keys=False).sample(
        n=50, random_state=SEED
    ).reset_index(drop=True)
    review = review[["complaint_id", "text", "language", "sector", "category", "sentiment", "priority"]].copy()
    for col in ["human_category_label", "human_sentiment_label", "human_priority_label", "reviewer_id", "review_notes"]:
        review[col] = ""
    review.to_csv(args.output / "annotation_review_sample.csv", index=False)

    summary = {
        "seed": SEED,
        "synthetic": True,
        "real_customer_data_used": False,
        "human_labels_verified": False,
        "incidents": int(complaints.incident_id.nunique()),
        "complaints": len(complaints),
        "duplicate_pairs": len(pairs),
        "counts": {
            "split": complaints.split.value_counts().to_dict(),
            "language": complaints.language.value_counts().to_dict(),
            "sector": complaints.sector.value_counts().to_dict(),
            "category": complaints.category.value_counts().to_dict(),
            "difficulty": complaints.difficulty.value_counts().to_dict(),
            "with_secondary_issue": int((complaints.secondary_category != "").sum()),
            "sentiment": complaints.sentiment.value_counts().to_dict(),
            "priority": complaints.priority.value_counts().to_dict(),
        },
        "pair_counts": {
            "split": pairs.split.value_counts().to_dict(),
            "label": pairs.label.value_counts().to_dict(),
            "pair_type": pairs.pair_type.value_counts().to_dict(),
            "language_relation": pairs.language_relation.value_counts().to_dict(),
        },
    }
    (args.output / "data_summary.json").write_text(json.dumps(summary, indent=2, ensure_ascii=False), encoding="utf-8")
    print(json.dumps(summary, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
