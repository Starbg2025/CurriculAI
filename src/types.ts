/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  startDate: string;
  endDate: string;
}

export interface CVData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    website: string;
    jobTitle: string;
    summary: string;
  };
  experiences: Experience[];
  education: Education[];
  skills: string[];
  languages: string[];
  interests: string[];
}

export const initialCVData: CVData = {
  personalInfo: {
    fullName: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    jobTitle: "",
    summary: "",
  },
  experiences: [],
  education: [],
  skills: [],
  languages: [],
  interests: [],
};
