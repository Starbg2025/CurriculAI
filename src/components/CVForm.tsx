/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { CVData, Experience, Education } from '../types';
import { Plus, Trash2, Wand2, Loader2, Sparkles, Send, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';
import { generateCVSummary, generateExperienceDescription, generateFullCVFromPrompt, generateCVFromImages } from '../lib/geminiService';
import { cn } from '../lib/utils';

interface CVFormProps {
  data: CVData;
  onChange: (newData: CVData) => void;
}

export const CVForm: React.FC<CVFormProps> = ({ data, onChange }) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [magicPrompt, setMagicPrompt] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMagicGeneration = async () => {
    if (!magicPrompt) return;
    setLoading('magic');
    const fullData = await generateFullCVFromPrompt(magicPrompt);
    if (fullData) {
      onChange(fullData);
      setMagicPrompt("");
    }
    setLoading(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setLoading('image');
    
    try {
      const promises = Array.from(files).map((file: File) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve((reader.result as string).split(',')[1]);
          };
          reader.readAsDataURL(file);
        });
      });

      const base64Strings = await Promise.all(promises);
      const fullData = await generateCVFromImages(base64Strings);
      if (fullData) {
        onChange(fullData);
      }
      setLoading(null);
      // Reset input value to allow re-uploading same files
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error("Images processing error", err);
      setLoading(null);
    }
  };

  const updatePersonalInfo = (field: keyof typeof data.personalInfo, value: string) => {
    onChange({
      ...data,
      personalInfo: { ...data.personalInfo, [field]: value }
    });
  };

  const handleGenerateSummary = async () => {
    if (!data.personalInfo.jobTitle) {
      alert("Veuillez d'abord saisir un intitulé de poste.");
      return;
    }
    setLoading('summary');
    const summary = await generateCVSummary(data.personalInfo.jobTitle, data.personalInfo.summary || "mon expérience et mes compétences");
    updatePersonalInfo('summary', summary);
    setLoading(null);
  };

  const addExperience = () => {
    const newExp: Experience = {
      id: Math.random().toString(36).substr(2, 9),
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      description: ""
    };
    onChange({ ...data, experiences: [...data.experiences, newExp] });
  };

  const updateExperience = (id: string, field: keyof Experience, value: string) => {
    onChange({
      ...data,
      experiences: data.experiences.map(exp => exp.id === id ? { ...exp, [field]: value } : exp)
    });
  };

  const removeExperience = (id: string) => {
    onChange({ ...data, experiences: data.experiences.filter(exp => exp.id !== id) });
  };

  const handleGenerateExperience = async (exp: Experience) => {
    if (!exp.position || !exp.company) {
      alert("Veuillez saisir le poste et l'entreprise.");
      return;
    }
    setLoading(exp.id);
    const desc = await generateExperienceDescription(exp.position, exp.company, exp.description);
    updateExperience(exp.id, 'description', desc);
    setLoading(null);
  };

  const addEducation = () => {
    const newEdu: Education = {
      id: Math.random().toString(36).substr(2, 9),
      school: "",
      degree: "",
      startDate: "",
      endDate: ""
    };
    onChange({ ...data, education: [...data.education, newEdu] });
  };

  const removeEducation = (id: string) => {
    onChange({ ...data, education: data.education.filter(edu => edu.id !== id) });
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    onChange({
      ...data,
      education: data.education.map(edu => edu.id === id ? { ...edu, [field]: value } : edu)
    });
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Magic AI Generation */}
      <section className="bg-gradient-to-br from-stone-900 to-[#3E4E50] p-6 rounded-3xl shadow-xl border border-stone-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-[#889E81] rounded-xl flex items-center justify-center">
            <Sparkles className="text-white w-6 h-6" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white leading-tight">Génération Magique</h2>
            <p className="text-stone-400 text-[10px] uppercase font-bold tracking-widest mt-1">Prompt ou Image</p>
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              multiple
              onChange={handleImageUpload}
              disabled={loading !== null}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={loading !== null}
              className="px-4 py-2 bg-white/5 border border-white/10 text-white text-[10px] font-bold rounded-xl hover:bg-white/10 transition-all flex items-center gap-2 disabled:opacity-50"
              title="Scanner une ou plusieurs images de CV"
            >
              {loading === 'image' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <ImageIcon className="w-4 h-4" />
                  Scanner Image
                </>
              )}
            </button>
          </div>
        </div>
        <div className="relative">
          <textarea 
            className="w-full h-24 p-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder-stone-500 focus:ring-2 focus:ring-[#889E81] outline-none resize-none transition-all"
            placeholder="Décrivez votre parcours ou scannez votre ancien CV..."
            value={magicPrompt}
            onChange={(e) => setMagicPrompt(e.target.value)}
          />
          <button 
            onClick={handleMagicGeneration}
            disabled={loading === 'magic' || !magicPrompt}
            className="absolute bottom-3 right-3 p-3 bg-[#889E81] text-white rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
          >
            {loading === 'magic' ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {["Étudiant en Marketing", "Développeur Senior", "Infirmier"].map((label) => (
            <button
              key={label}
              onClick={() => setMagicPrompt(`Je suis un ${label.toLowerCase()}, crée-moi un CV complet et impressionnant.`)}
              className="text-[10px] bg-white/10 text-stone-300 px-3 py-1 rounded-full hover:bg-white/20 transition-colors border border-white/5"
            >
              + {label}
            </button>
          ))}
        </div>
      </section>

      {/* Infos Personnelles */}
      <section>
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#889E81] text-white flex items-center justify-center text-sm font-bold shadow-sm">1</div>
          Informations Personnelles
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Nom Complet</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 bg-[#F5F5F0] border-none rounded-xl text-sm focus:ring-2 focus:ring-[#889E81] outline-none transition-all"
              placeholder="Jean Dupont"
              value={data.personalInfo.fullName}
              onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Poste Cible</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 bg-[#F5F5F0] border-none rounded-xl text-sm focus:ring-2 focus:ring-[#889E81] outline-none transition-all"
              placeholder="Développeur Fullstack"
              value={data.personalInfo.jobTitle}
              onChange={(e) => updatePersonalInfo('jobTitle', e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Email</label>
            <input 
              type="email" 
              className="w-full px-4 py-3 bg-[#F5F5F0] border-none rounded-xl text-sm focus:ring-2 focus:ring-[#889E81] outline-none transition-all"
              placeholder="jean.dupont@email.com"
              value={data.personalInfo.email}
              onChange={(e) => updatePersonalInfo('email', e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Téléphone</label>
            <input 
              type="tel" 
              className="w-full px-4 py-3 bg-[#F5F5F0] border-none rounded-xl text-sm focus:ring-2 focus:ring-[#889E81] outline-none transition-all"
              placeholder="+33 6 12 34 56 78"
              value={data.personalInfo.phone}
              onChange={(e) => updatePersonalInfo('phone', e.target.value)}
            />
          </div>
        </div>
        <div className="mt-6 space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Résumé Professionnel</label>
            <button 
              onClick={handleGenerateSummary}
              disabled={loading === 'summary'}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#889E81] text-white text-xs font-bold rounded-full hover:shadow-lg hover:shadow-[#889E81]/30 transition-all disabled:opacity-50"
            >
              {loading === 'summary' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
              Optimisation IA
            </button>
          </div>
          <textarea 
            className="w-full h-32 px-4 py-3 bg-[#F5F5F0] border-none rounded-xl text-sm focus:ring-2 focus:ring-[#889E81] outline-none transition-all resize-none"
            placeholder="Décrivez votre parcours..."
            value={data.personalInfo.summary}
            onChange={(e) => updatePersonalInfo('summary', e.target.value)}
          />
        </div>
      </section>

      {/* Expériences */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#E5D3B3] text-[#3E4E50] flex items-center justify-center text-sm font-bold shadow-sm">2</div>
            Expériences
          </h2>
          <button 
            onClick={addExperience}
            className="flex items-center gap-1 px-4 py-2 bg-[#3E4E50] text-white text-xs font-bold rounded-xl hover:bg-[#2C3839] transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" /> Ajouter
          </button>
        </div>
        
        <div className="space-y-6">
          {data.experiences.map((exp) => (
            <div key={exp.id} className="p-6 bg-[#FDFCF7] border border-stone-100 rounded-2xl relative group shadow-sm">
              <button 
                onClick={() => removeExperience(exp.id)}
                className="absolute -top-2 -right-2 w-7 h-7 bg-white border border-stone-200 rounded-full flex items-center justify-center text-red-400 hover:bg-red-50 transition-all shadow-md z-10"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <input 
                  type="text" 
                  placeholder="Poste"
                  className="px-4 py-2.5 bg-[#F5F5F0] border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#889E81]"
                  value={exp.position}
                  onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                />
                <input 
                  type="text" 
                  placeholder="Entreprise"
                  className="px-4 py-2.5 bg-[#F5F5F0] border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#889E81]"
                  value={exp.company}
                  onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                />
                <input 
                  type="text" 
                  placeholder="Date Début"
                  className="px-4 py-2.5 bg-[#F5F5F0] border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#889E81]"
                  value={exp.startDate}
                  onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                />
                <input 
                  type="text" 
                  placeholder="Date Fin"
                  className="px-4 py-2.5 bg-[#F5F5F0] border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#889E81]"
                  value={exp.endDate}
                  onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Missions & Résultats</label>
                  <button 
                    onClick={() => handleGenerateExperience(exp)}
                    disabled={loading === exp.id}
                    className="flex items-center gap-1.5 px-3 py-1 bg-[#889E81]/10 text-[#6B7F65] text-xs font-bold rounded-lg hover:bg-[#889E81]/20 transition-all disabled:opacity-50"
                  >
                    {loading === exp.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                    Amélioration par l'IA
                  </button>
                </div>
                <textarea 
                  className="w-full h-24 px-4 py-3 bg-[#F5F5F0] border-none rounded-xl text-sm outline-none resize-none focus:ring-2 focus:ring-[#889E81]"
                  placeholder="Détaillez vos succès..."
                  value={exp.description}
                  onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                />
              </div>
            </div>
          ))}
          {data.experiences.length === 0 && (
            <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl">
              <p className="text-sm text-slate-400">Aucune expérience ajoutée.</p>
            </div>
          )}
        </div>
      </section>

      {/* Formation */}
       <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#C2A87E] text-white flex items-center justify-center text-sm font-bold shadow-sm">3</div>
            Formations
          </h2>
          <button 
            onClick={addEducation}
            className="flex items-center gap-1 px-4 py-2 bg-[#3E4E50] text-white text-xs font-bold rounded-xl hover:bg-[#2C3839] transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" /> Ajouter
          </button>
        </div>
        
        <div className="space-y-4">
          {data.education.map((edu) => (
            <div key={edu.id} className="p-6 bg-[#FDFCF7] border border-stone-100 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4 relative shadow-sm">
              <button 
                onClick={() => removeEducation(edu.id)}
                className="absolute -top-2 -right-2 w-7 h-7 bg-white border border-stone-200 rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 transition-all shadow-md z-10"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <input 
                type="text" 
                placeholder="Diplôme"
                className="px-4 py-2.5 bg-[#F5F5F0] border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#889E81]"
                value={edu.degree}
                onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
              />
              <input 
                type="text" 
                placeholder="École / Université"
                className="px-4 py-2.5 bg-[#F5F5F0] border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#889E81]"
                value={edu.school}
                onChange={(e) => updateEducation(edu.id, 'school', e.target.value)}
              />
              <input 
                type="text" 
                placeholder="Année début"
                className="px-4 py-2.5 bg-[#F5F5F0] border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#889E81]"
                value={edu.startDate}
                onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
              />
              <input 
                type="text" 
                placeholder="Année fin"
                className="px-4 py-2.5 bg-[#F5F5F0] border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#889E81]"
                value={edu.endDate}
                onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Compétences (Quick Tags) */}
      <section>
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#3E4E50] text-white flex items-center justify-center text-sm font-bold shadow-sm">4</div>
          Compétences & Langues
        </h2>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider block mb-2">Compétences (séparées par une virgule)</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 bg-[#F5F5F0] border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#889E81]"
              placeholder="React, TypeScript, Node.js..."
              value={data.skills.join(', ')}
              onChange={(e) => onChange({ ...data, skills: e.target.value.split(',').map(s => s.trim()).filter(s => s !== "") })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider block mb-2">Langues</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 bg-[#F5F5F0] border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#889E81]"
              placeholder="Français (Natif), Anglais (C1)..."
              value={data.languages.join(', ')}
              onChange={(e) => onChange({ ...data, languages: e.target.value.split(',').map(s => s.trim()).filter(s => s !== "") })}
            />
          </div>
        </div>
      </section>
    </div>
  );
};
