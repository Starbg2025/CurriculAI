/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";
import { CVData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateFullCVFromPrompt(prompt: string): Promise<CVData | null> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Tu es un consultant expert en recrutement de haut niveau. Ta mission est de créer un CV ULTRA-PROFESSIONNEL, moderne et impactant en français à partir de cette demande : "${prompt}". 
      
      CONSIGNES DE RÉDACTION :
      - Utilise un vocabulaire soutenu et des verbes d'action puissants (ex: "Piloté", "Optimisé", "Architecturé").
      - Pour les expériences, crée des descriptions détaillées avec des puces (•) incluant des résultats chiffrés fictifs mais réalistes (ex: "+20% de productivité").
      - Le résumé profil doit être inspirant et positionner le candidat comme un expert.
      - Invente des détails cohérents (entreprises prestigieuses, diplômes reconnus) si nécessaire.
      - Ne fais pas de CV "basique", vise l'excellence comme si un coach y avait passé 2 jours.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            personalInfo: {
              type: Type.OBJECT,
              properties: {
                fullName: { type: Type.STRING },
                jobTitle: { type: Type.STRING },
                email: { type: Type.STRING },
                phone: { type: Type.STRING },
                location: { type: Type.STRING },
                website: { type: Type.STRING },
                summary: { type: Type.STRING },
              },
              required: ["fullName", "jobTitle", "summary"]
            },
            experiences: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  company: { type: Type.STRING },
                  position: { type: Type.STRING },
                  startDate: { type: Type.STRING },
                  endDate: { type: Type.STRING },
                  description: { type: Type.STRING },
                },
                required: ["id", "company", "position", "startDate", "description"]
              }
            },
            education: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  school: { type: Type.STRING },
                  degree: { type: Type.STRING },
                  startDate: { type: Type.STRING },
                  endDate: { type: Type.STRING },
                },
                required: ["id", "school", "degree", "startDate", "endDate"]
              }
            },
            skills: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            languages: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            interests: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["personalInfo", "experiences", "education", "skills", "languages", "interests"]
        }
      }
    });

    const text = response.text?.trim() || "";
    return JSON.parse(text) as CVData;
  } catch (error) {
    console.error("Gemini Full CV Generation Error:", error);
    return null;
  }
}

export async function generateCVFromImages(base64Images: string[]): Promise<CVData | null> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: "user",
          parts: [
            { text: "Analyse ces images de CV (qui peuvent être plusieurs pages d'un même CV) et extrait toutes les informations structurées en français. Regroupe les informations de toutes les pages de façon cohérente. Si des informations manquent, laisse les champs vides ou invente des détails cohérents pour un profil professionnel complet. Le but est de recréer fidèlement le contenu du CV original." },
            ...base64Images.map(img => ({
              inlineData: {
                mimeType: "image/jpeg",
                data: img
              }
            }))
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            personalInfo: {
              type: Type.OBJECT,
              properties: {
                fullName: { type: Type.STRING },
                jobTitle: { type: Type.STRING },
                email: { type: Type.STRING },
                phone: { type: Type.STRING },
                location: { type: Type.STRING },
                website: { type: Type.STRING },
                summary: { type: Type.STRING },
              },
              required: ["fullName", "jobTitle", "summary"]
            },
            experiences: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  company: { type: Type.STRING },
                  position: { type: Type.STRING },
                  startDate: { type: Type.STRING },
                  endDate: { type: Type.STRING },
                  description: { type: Type.STRING },
                },
                required: ["id", "company", "position", "startDate", "description"]
              }
            },
            education: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  school: { type: Type.STRING },
                  degree: { type: Type.STRING },
                  startDate: { type: Type.STRING },
                  endDate: { type: Type.STRING },
                },
                required: ["id", "school", "degree", "startDate", "endDate"]
              }
            },
            skills: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            languages: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            interests: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["personalInfo", "experiences", "education", "skills", "languages", "interests"]
        }
      }
    });

    const text = response.text?.trim() || "";
    const jsonString = text.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    return JSON.parse(jsonString) as CVData;
  } catch (error) {
    console.error("Gemini Image CV Generation Error:", error);
    return null;
  }
}

export async function processChatRequest(chatHistory: { role: 'user' | 'model', text: string }[], currentData: CVData): Promise<{ text: string, updatedData?: CVData }> {
  try {
    const systemInstruction = `Tu es un assistant expert en CV. Tu aides l'utilisateur à créer et affiner son CV de manière conversationnelle. 
    L'utilisateur te parle pour modifier des sections, ajouter des détails ou changer le ton.
    Si l'utilisateur demande un changement structurel (ex: "ajoute une expérience chez Google" ou "rend le résumé plus dynamique"), tu DOIS renvoyer le nouveau JSON complet du CV dans "updatedData".
    
    TON FORMAT DE RÉPONSE STRICT (JSON) :
    {
      "message": "Ta réponse textuelle amicale à l'utilisateur",
      "updatedData": { ...objet CVData complet si modifié, sinon null... }
    }
    
    Données actuelles du CV pour contexte : ${JSON.stringify(currentData)}`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: chatHistory.map(h => ({ role: h.role === 'model' ? 'model' : 'user', parts: [{ text: h.text }] })),
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        maxOutputTokens: 2048, // Limit output to prevent truncation/hallucination
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            message: { type: Type.STRING },
            updatedData: { 
              type: Type.OBJECT,
              nullable: true,
              properties: {
                personalInfo: { 
                  type: Type.OBJECT, 
                  properties: { 
                    fullName: { type: Type.STRING }, 
                    jobTitle: { type: Type.STRING }, 
                    email: { type: Type.STRING }, 
                    phone: { type: Type.STRING }, 
                    location: { type: Type.STRING }, 
                    website: { type: Type.STRING }, 
                    summary: { type: Type.STRING } 
                  } 
                },
                experiences: { 
                  type: Type.ARRAY, 
                  items: { 
                    type: Type.OBJECT, 
                    properties: { 
                      id: { type: Type.STRING }, 
                      company: { type: Type.STRING }, 
                      position: { type: Type.STRING }, 
                      startDate: { type: Type.STRING }, 
                      endDate: { type: Type.STRING }, 
                      description: { type: Type.STRING } 
                    } 
                  } 
                },
                education: { 
                  type: Type.ARRAY, 
                  items: { 
                    type: Type.OBJECT, 
                    properties: { 
                      id: { type: Type.STRING }, 
                      school: { type: Type.STRING }, 
                      degree: { type: Type.STRING }, 
                      startDate: { type: Type.STRING }, 
                      endDate: { type: Type.STRING } 
                    } 
                  } 
                },
                skills: { type: Type.ARRAY, items: { type: Type.STRING } },
                languages: { type: Type.ARRAY, items: { type: Type.STRING } },
                interests: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            }
          },
          required: ["message"]
        }
      }
    });

    const textOutput = response.text?.trim() || "";
    // Clean potential markdown code blocks if the model ignored responseMimeType
    const jsonString = textOutput.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    const result = JSON.parse(jsonString);
    
    return {
      text: result.message,
      updatedData: result.updatedData || undefined
    };
  } catch (error) {
    console.error("Chat Error Detailed:", error);
    return { text: "Désolé, je rencontre une difficulté technique pour traiter cette demande précise. Pouvez-vous reformuler ?" };
  }
}

export async function generateCVSummary(jobTitle: string, keyPoints: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Tu es un expert en recrutement. Écris un résumé professionnel percutant (en français) pour un profil de "${jobTitle}". Points clés à inclure : ${keyPoints}. Le ton doit être professionnel et moderne. Fais-le tenir en 3-4 phrases.`,
    });
    return response.text?.trim() || "";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "";
  }
}

export async function generateExperienceDescription(position: string, company: string, bulletPoints: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Tu es un expert en recrutement. Transforme ces notes en une description d'expérience professionnelle structurée (en français) pour le poste de "${position}" chez "${company}". Notes : ${bulletPoints}. Utilise des verbes d'action et mets en avant les résultats. Formate cela avec des tirets (•).`,
    });
    return response.text?.trim() || "";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "";
  }
}

export async function optimizeCV(data: CVData) {
  // Can be used for a full CV optimization
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Optimise ce CV pour le rendre plus professionnel et impactant. Renvoie uniquement le JSON optimisé suivant la même structure. Structure : ${JSON.stringify(data)}`,
      config: {
        responseMimeType: "application/json"
      }
    });
    const text = response.text?.trim() || "";
    return JSON.parse(text) as CVData;
  } catch (error) {
    console.error("Gemini Error:", error);
    return data;
  }
}
