/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { forwardRef } from 'react';
import { CVData } from '../types';

interface CVPreviewProps {
  data: CVData;
}

export const CVPreview = forwardRef<HTMLDivElement, CVPreviewProps>(({ data }, ref) => {
  const { personalInfo, experiences, education, skills, languages, interests } = data;

  return (
    <div ref={ref} className="cv-page font-sans text-slate-800 flex flex-col shadow-2xl relative overflow-hidden bg-white">
      {/* Premium Header */}
      <div className="h-44 bg-[#3E4E50] w-full p-12 flex flex-col justify-center relative overflow-hidden">
         {/* Abstract background shape */}
         <div className="absolute top-0 right-0 w-64 h-64 bg-[rgba(136,158,129,0.2)] rounded-full -mr-20 -mt-20" />
         
         <div className="relative z-10">
           <h1 className="text-white text-5xl font-serif italic mb-2 tracking-tight">
             {personalInfo.fullName || "Votre Nom"}
           </h1>
           <div className="flex items-center gap-4">
             <div className="h-[1px] w-12 bg-[#889E81]" />
             <p className="text-[rgba(253,252,247,0.9)] text-sm font-bold uppercase tracking-[0.2em]">
               {personalInfo.jobTitle || "EXPERT STRATÉGIQUE"}
             </p>
           </div>
         </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Left Column (Modern Info) */}
        <div className="w-[32%] bg-[#F9F8F4] p-10 border-r border-stone-100 flex flex-col gap-10">
          <section>
            <h4 className="text-[11px] font-black uppercase text-[#3E4E50] mb-4 tracking-[0.15em] border-b border-[rgba(136,158,129,0.3)] pb-2">Coordonnées</h4>
            <div className="space-y-3 text-[11px] text-slate-600 font-medium">
              {personalInfo.email && (
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] uppercase text-stone-400">Email</span>
                  <p className="break-all">{personalInfo.email}</p>
                </div>
              )}
              {personalInfo.phone && (
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] uppercase text-stone-400">Téléphone</span>
                  <p>{personalInfo.phone}</p>
                </div>
              )}
              {personalInfo.location && (
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] uppercase text-stone-400">Localisation</span>
                  <p>{personalInfo.location}</p>
                </div>
              )}
            </div>
          </section>

          <section>
            <h4 className="text-[11px] font-black uppercase text-[#3E4E50] mb-4 tracking-[0.15em] border-b border-[rgba(136,158,129,0.3)] pb-2">Expertise</h4>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, i) => (
                <span key={i} className="text-[10px] font-semibold text-[#3E4E50] bg-white border border-stone-200 px-2.5 py-1 rounded-full shadow-sm">
                  {skill}
                </span>
              ))}
            </div>
          </section>

          <section>
            <h4 className="text-[11px] font-black uppercase text-[#3E4E50] mb-5 tracking-[0.15em] border-b border-[rgba(136,158,129,0.3)] pb-2">Cursus</h4>
            <div className="space-y-6">
              {education.map((edu) => (
                <div key={edu.id} className="relative pl-4">
                  <div className="absolute left-0 top-1 bottom-0 w-[1px] bg-[#889E81]" />
                  <p className="text-[11px] font-bold text-slate-900 leading-tight">{edu.degree}</p>
                  <p className="text-[10px] text-[#889E81] font-bold mt-1 lowercase">{edu.startDate} — {edu.endDate}</p>
                  <p className="text-[10px] text-stone-500 italic mt-1 font-medium">{edu.school}</p>
                </div>
              ))}
            </div>
          </section>

          {languages.length > 0 && (
            <section>
              <h4 className="text-[11px] font-black uppercase text-[#3E4E50] mb-4 tracking-[0.15em] border-b border-[rgba(136,158,129,0.3)] pb-2">Langues</h4>
              <div className="grid grid-cols-1 gap-2">
                {languages.map((lang, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-[#889E81]" />
                    <p className="text-[10px] text-slate-700 font-bold">{lang}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Column (Editorial Experience) */}
        <div className="flex-1 p-12 bg-white flex flex-col gap-12">
          {personalInfo.summary && (
            <section>
              <h4 className="text-[12px] font-black text-[#3E4E50] mb-5 uppercase tracking-widest flex items-center gap-4">
                <span>Profil</span>
                <div className="h-[1px] flex-1 bg-stone-100" />
              </h4>
              <p className="text-[12px] leading-[1.7] text-slate-600 whitespace-pre-wrap font-serif italic text-justify">
                {personalInfo.summary}
              </p>
            </section>
          )}

          <section>
            <h4 className="text-[12px] font-black text-[#3E4E50] mb-6 uppercase tracking-widest flex items-center gap-4">
              <span>Expériences</span>
              <div className="h-[1px] flex-1 bg-stone-100" />
            </h4>
            <div className="space-y-10">
              {experiences.length > 0 ? (
                experiences.map((exp) => (
                  <div key={exp.id} className="group">
                    <div className="flex justify-between items-baseline mb-2">
                      <p className="text-[13px] font-black text-slate-900 group-hover:text-[#889E81] transition-colors">{exp.position}</p>
                      <p className="text-[10px] font-black text-[#889E81] bg-[rgba(136,158,129,0.1)] px-2 py-0.5 rounded-sm uppercase tracking-tighter">{exp.startDate} — {exp.endDate || "Présent"}</p>
                    </div>
                    <p className="text-[11px] font-bold text-stone-400 mb-3 tracking-wide">{exp.company}</p>
                    <div className="text-[11px] leading-[1.6] text-slate-600 whitespace-pre-wrap pl-4 border-l border-stone-100">
                      {exp.description}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-[11px] italic text-stone-300">Prêt pour votre prochaine étape professionnelle...</p>
              )}
            </div>
          </section>

          {interests.length > 0 && (
            <section className="mt-auto">
              <h4 className="text-[10px] font-black text-stone-300 mb-3 uppercase tracking-[0.2em] text-center">Centres d'intérêt</h4>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
                {interests.map((int, i) => (
                  <span key={i} className="text-[10px] text-stone-400 font-bold uppercase tracking-tighter italic">{int}</span>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
      
      {/* Decorative footer line */}
      <div className="h-2 bg-[#3E4E50] w-full" />
    </div>
  );
});

CVPreview.displayName = "CVPreview";
