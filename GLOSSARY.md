# MedVal Landing

The public marketing site for MedVal, presenting one international offering in Spanish and English.

## Language

**Region**:
A market MedVal serves: international, Venezuela, the United States, or Colombia. International is the sole public offering; the other markets remain part of historical content and submissions.
_Avoid_: Country (a region is a market, not a sovereign state — `int` is not a country), locale (legacy term from the pre-2026 model where region and language were conflated)

**Language**:
The language a page is rendered in: `es` or `en`. A language is the Payload localization axis: marketing copy (the Landing global) exists in one version per language.
_Avoid_: Locale, locale code

**Page**:
The international offering presented in one language. There are two public pages, Spanish and English, each with marketing copy and international contact details in that language.
_Avoid_: Locale (legacy)

**Catalog item**:
A medicine or sterile solution displayed in the informational catalog. It has localized commercial copy, pharmaceutical facts (active ingredient, concentration, form, presentation, laboratory, registration), a prescription notice and one or more photos. It is never purchasable.
_Avoid_: Product (reserved for the marketing product cards in the Landing global)
