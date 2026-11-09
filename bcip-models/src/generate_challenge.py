"""Create a synthetic template-held-out challenge set.

These issue and cue templates are never used by generate_data.py. The set tests
wording generalization; it is still synthetic and is not a substitute for real data.
"""
from pathlib import Path
import pandas as pd
from generate_data import CATEGORIES, LANGUAGES, SECTORS, TERMS

ROOT = Path(__file__).resolve().parents[1]

ISSUES = {
    "english": {
        "billing": "The amount deducted from my wallet does not agree with the receipt total for {item}.",
        "delivery": "Tracking shows no movement on {item}, even though the promised date has passed.",
        "product_quality": "{item_cap} stopped working correctly during its first normal use.",
        "customer_service": "The {staff} kept transferring my query and eventually ended the conversation.",
        "technical_issue": "Every attempt to open {item} in the {system} ends in a blank screen.",
        "refund_return": "The returned {item} reached your facility, but my bank balance has not changed.",
    },
    "urdu": {
        "billing": "میرے والٹ سے کٹائی گئی رقم {item} کی رسید کے کل کل سے مطابقت نہیں رکھتی۔",
        "delivery": "{item} کی ٹریکنگ میں کوئی پیش رفت نہیں، اگرچہ وعدہ کی گئی تاریخ گزر چکی ہے۔",
        "product_quality": "{item} پہلے معمول کے استعمال میں ہی درست کام کرنا چھوڑ گیا۔",
        "customer_service": "{staff} میری درخواست ایک سے دوسرے کے پاس بھیجتا رہا اور آخر میں گفتگو ختم کر دی۔",
        "technical_issue": "{system} میں {item} کھولنے کی ہر کوشش خالی اسکرین پر ختم ہوتی ہے۔",
        "refund_return": "واپس بھیجا گیا {item} آپ کی سہولت تک پہنچ گیا، لیکن میرے بینک بیلنس میں کوئی تبدیلی نہیں آئی۔",
    },
    "roman_urdu": {
        "billing": "Mere wallet se deduct hui amount {item} ke receipt total se match nahi karti.",
        "delivery": "{item} ki tracking mein koi movement nahi, halanke promised date guzar chuki hai.",
        "product_quality": "{item} pehle normal use mein hi sahi kaam karna chor gaya.",
        "customer_service": "{staff} meri query aik se doosre ke paas bhejta raha aur aakhir mein conversation end kar di.",
        "technical_issue": "{system} mein {item} kholne ki har koshish blank screen par khatam hoti hai.",
        "refund_return": "Return kiya gaya {item} aap ki facility tak pahunch gaya, lekin mere bank balance mein koi tabdeeli nahi aayi.",
    },
}

SENTIMENT_CUES = {
    "english": {
        "neutral": "Please tell me what further information you need from me.",
        "negative": "After this experience, I am considering taking my business elsewhere.",
        "mixed": "Thank you for listening, but I cannot say that I am satisfied with the outcome.",
    },
    "urdu": {
        "neutral": "براہ کرم بتائیں کہ آپ کو میری جانب سے مزید کیا معلومات درکار ہیں۔",
        "negative": "اس تجربے کے بعد میں اپنی خریداری کہیں اور سے کرنے پر غور کر رہا ہوں۔",
        "mixed": "میری بات سننے کا شکریہ، لیکن میں اس نتیجے سے مطمئن ہونے کا دعویٰ نہیں کر سکتا۔",
    },
    "roman_urdu": {
        "neutral": "Barah-e-karam batayein ke aap ko meri taraf se mazeed kya information chahiye.",
        "negative": "Is experience ke baad main apni shopping kahin aur se karne par soch raha hoon.",
        "mixed": "Meri baat sunne ka shukriya, lekin main is outcome se satisfied hone ka dawa nahi kar sakta.",
    },
}

PRIORITY_CUES = {
    "english": {
        "low": "There is no immediate deadline; an update later this week would be acceptable.",
        "medium": "I would like this sorted within a few days because it is disrupting normal use.",
        "high": "This is my fourth follow-up, and the continued failure is interrupting my work.",
        "critical": "Someone could be injured by this defect, so stop further use and respond immediately.",
    },
    "urdu": {
        "low": "کوئی فوری آخری تاریخ نہیں؛ اسی ہفتے کے آخر میں معلومات بھی قابل قبول ہوں گی۔",
        "medium": "چونکہ یہ معمول کے استعمال میں رکاوٹ ہے، اسے چند دن میں حل کیا جائے۔",
        "high": "یہ میرا چوتھا فالو اپ ہے اور مسلسل ناکامی میرے کام میں خلل ڈال رہی ہے۔",
        "critical": "اس خرابی سے کسی کو چوٹ لگ سکتی ہے، اس لیے مزید استعمال روکیں اور فوری جواب دیں۔",
    },
    "roman_urdu": {
        "low": "Koi immediate deadline nahi; is week ke end par update bhi acceptable hoga.",
        "medium": "Chunke yeh normal use mein rukawat hai, isey chand din mein sort kiya jaye.",
        "high": "Yeh mera chotha follow-up hai aur musalsal failure mere kaam mein khalal daal rahi hai.",
        "critical": "Is defect se kisi ko chot lag sakti hai, is liye mazeed use rok dein aur foran respond karein.",
    },
}


def main() -> None:
    rows = []
    for i in range(180):
        language = LANGUAGES[i % 3]
        sector = SECTORS[(i // 3) % 5]
        category = CATEGORIES[(i // 15) % 6]
        sentiment = ["neutral", "negative", "mixed"][(i // 3) % 3]
        priority = ["low", "medium", "high", "critical"][(i // 9) % 4]
        item, staff, system = TERMS[language][sector]
        values = {"item": item, "item_cap": item[0].upper() + item[1:], "staff": staff, "system": system}
        text = " ".join([
            ISSUES[language][category].format(**values),
            SENTIMENT_CUES[language][sentiment],
            PRIORITY_CUES[language][priority],
            f"Reference: PK-9{i:05d}.",
        ])
        rows.append({
            "complaint_id": f"CHAL-{i:04d}", "incident_id": f"CHAL-INC-{i:04d}",
            "text": text, "language": language, "sector": sector,
            "category": category, "sentiment": sentiment, "priority": priority,
            "difficulty": "template_held_out", "split": "challenge_test",
            "is_synthetic": True, "human_labels_verified": False,
        })
    df = pd.DataFrame(rows)
    df.to_csv(ROOT / "data" / "challenge_complaints.csv", index=False)
    print(df.groupby(["category", "language"]).size().unstack())
    print(f"Saved {len(df)} template-held-out complaints")


if __name__ == "__main__":
    main()
