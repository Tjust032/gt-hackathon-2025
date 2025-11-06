# 💊 Cedar Medication Addition Tool

A comprehensive Cedar tool that allows users to add medications via chatbot with automatic image fetching, clinical data integration, and therapeutic information.

## 🚀 Features

- **AI-Powered Medication Lookup**: Uses OpenAI to fetch comprehensive medication information
- **Automatic Image Fetching**: Integrates with Unsplash API to find relevant medication images
- **Clinical Data Generation**: Creates realistic clinical trial and study information
- **Smart Categorization**: Automatically assigns therapeutic categories and tags
- **Complete Integration**: Seamlessly adds medications to your existing database

## 🎯 How to Use

### Via Chatbot

Users can simply ask the chatbot to add medications using natural language:

```
"Add Tylenol to my medication database"
"Can you add Lisinopril 10mg from Pfizer?"
"Add aspirin with clinical trial information"
"Please add Metformin, include images and studies"
```

### Supported Parameters

The tool accepts the following optional parameters:

- **medicationName** (required): Name of the medication
- **genericName**: Generic name if different from brand name
- **dosage**: Dosage information (e.g., "500mg", "10mg/ml")
- **manufacturer**: Manufacturer name
- **therapeuticClass**: Therapeutic category
- **includeImage**: Whether to fetch images (default: true)
- **includeClinicalData**: Whether to fetch clinical data (default: true)
- **additionalNotes**: Any additional requirements

## 🔧 Technical Implementation

### Backend Tool (Mastra)

The tool is registered in the Mastra backend at:

- `src/backend/src/mastra/tools/toolDefinitions.ts`

### Frontend Integration

The frontend tool is registered in:

- `src/app/dashboard/medications/page.tsx`

### API Endpoint

The medication lookup and addition logic is handled by:

- `src/app/api/add-medication/route.ts`

## 📊 Data Sources

### Medication Information

- **OpenAI GPT-4**: Comprehensive medication details, therapeutic classification
- **AI-Generated**: Dosage forms, strengths, descriptions, and therapeutic categories

### Images

- **Unsplash API**: High-quality medication and pharmaceutical images
- **Fallback**: Placeholder images if Unsplash is unavailable

### Clinical Data

- **AI-Generated**: Realistic clinical trial information for educational purposes
- **Includes**: Efficacy studies, safety profiles, comparative analyses

## 🏷️ Therapeutic Categories

The tool automatically assigns medications to relevant categories:

- **Cardiovascular**: Heart and blood vessel medications
- **Oncology**: Cancer treatment drugs
- **Immunotherapy**: Immune system modulators
- **Biologics**: Biological therapeutic products
- **Neurology**: Neurological condition treatments
- **Endocrinology**: Hormone and metabolic medications
- **And more...**

## 🎨 Visual Features

### Colored Tag Pills

Medications are automatically tagged with colored pills for easy categorization:

- 🟣 **Oncology**: Purple pills
- 🟢 **Immunotherapy**: Green pills
- 🔵 **Cardiovascular**: Red pills
- 🟡 **Biologics**: Teal pills

### Smart Links

Each medication gets a unique smart link for easy sharing and access.

## 🔐 Environment Variables

To enable full functionality, set these environment variables:

```env
# Required for medication information
OPENAI_API_KEY=your_openai_api_key

# Optional for image fetching
UNSPLASH_ACCESS_KEY=your_unsplash_access_key
```

## 📝 Example Usage

### Simple Addition

```
User: "Add Tylenol"
Bot: "I'll add Tylenol to your medication database with images and clinical information."
```

### Detailed Addition

```
User: "Add Lisinopril 10mg from Pfizer for cardiovascular treatment"
Bot: "Adding Lisinopril 10mg from Pfizer with cardiovascular classification, images, and clinical studies."
```

### Batch Addition

```
User: "Add these medications: Aspirin, Metformin, and Atorvastatin"
Bot: "I'll add all three medications with their respective information and clinical data."
```

## 🎯 Benefits

1. **Time Saving**: No manual data entry required
2. **Comprehensive**: Includes images, clinical data, and therapeutic information
3. **Accurate**: AI-powered information lookup ensures accuracy
4. **Visual**: Colored categorization for easy identification
5. **Integrated**: Seamlessly works with existing medication management system

## 🔄 Workflow

1. User requests medication addition via chat
2. Tool extracts medication name and parameters
3. AI fetches comprehensive medication information
4. Images are retrieved from Unsplash API
5. Clinical data is generated using AI
6. Medication is added to database with smart link
7. User receives confirmation with medication details

## 🚀 Future Enhancements

- Integration with FDA API for official drug information
- Real clinical trial database connections
- Prescription verification and validation
- Drug interaction checking
- Inventory management features

---

_This tool demonstrates the power of Cedar's frontend tool system combined with AI-powered data enrichment for pharmaceutical applications._
