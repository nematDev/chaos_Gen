
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { RoadmapResponse } from "../types";
import { Project } from "../models/Project";

const SYSTEM_INSTRUCTION = `
Роль: Вы — Старший Технический Менеджер Проектов (Senior TPM).
Ваша цель: Превратить абстрактную идею пользователя в детальный, профессиональный план действий.

Ключевые принципы:
1. ДЕКОМПОЗИЦИЯ (Subtasks):
   - Каждая задача должна быть разбита на 3-6 конкретных подзадач (subtasks).
   - Подзадачи должны быть атомарными действиями (например: "Скачать установщик", "Запустить скрипт", "Проверить логи").

2. СТРУКТУРА:
   - Группируйте задачи по логическим этапам (Stages).
   - Приоритеты (Priority) должны отражать критический путь.

3. ОБОСНОВАНИЕ (Reasoning):
   - Кратко объясните, почему эта задача важна именно сейчас.

Формат ответа JSON:
- Язык: Русский.
- Строго соблюдайте схему.
`;

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    project_summary: {
      type: Type.STRING,
      description: "Краткое профессиональное резюме плана (на русском)",
    },
    stages: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          stage_name: { type: Type.STRING },
          tasks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.INTEGER },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                reasoning: { type: Type.STRING },
                priority: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
                status: { type: Type.STRING, enum: ["Todo", "In Progress", "Done"] },
                tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                subtasks: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING }, // AI can use string IDs or numbers
                      title: { type: Type.STRING },
                      status: { type: Type.STRING, enum: ["Todo", "Done"] }
                    },
                    required: ["title", "status"]
                  }
                }
              },
              required: ["id", "title", "description", "reasoning", "priority", "status", "tags", "subtasks"],
            },
          },
        },
        required: ["stage_name", "tasks"],
      },
    },
  },
  required: ["project_summary", "stages"],
};

export class GeminiGenerator {
  private ai: GoogleGenAI;

  constructor() {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key missing");
    this.ai = new GoogleGenAI({ apiKey });
  }

  public async generate(prompt: string): Promise<Project> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: responseSchema,
          temperature: 0.3, 
        },
      });

      const text = response.text;
      if (!text) throw new Error("Empty response from AI");

      const rawData = JSON.parse(text) as RoadmapResponse;
      // Post-process IDs to ensure subtasks have unique IDs if AI missed them
      rawData.stages.forEach(stage => {
        stage.tasks.forEach(task => {
          if (task.subtasks) {
            task.subtasks.forEach((sub, idx) => {
              if (!sub.id) sub.id = `${task.id}-sub-${idx}`;
              if (!sub.status) sub.status = 'Todo';
            });
          } else {
            task.subtasks = [];
          }
        });
      });

      return new Project(rawData);
    } catch (error) {
      console.error("Generator Error:", error);
      throw error;
    }
  }
}
