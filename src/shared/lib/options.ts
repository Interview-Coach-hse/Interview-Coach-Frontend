import {
  InterviewDirection,
  InterviewLevel,
  QuestionStatus,
  QuestionType,
  SessionState,
  UserStatus,
} from "@/api/generated/schema";

export const directionOptions = [
  { value: "", label: "Все направления" },
  { value: InterviewDirection.Backend, label: "Backend" },
  { value: InterviewDirection.Frontend, label: "Frontend" },
  { value: InterviewDirection.Devops, label: "DevOps" },
];

export const levelOptions = [
  { value: "", label: "Все уровни" },
  { value: InterviewLevel.Junior, label: "Junior" },
  { value: InterviewLevel.Middle, label: "Middle" },
];

export const sessionStateOptions = [
  { value: "", label: "Все статусы" },
  { value: SessionState.Created, label: "Создана" },
  { value: SessionState.InProgress, label: "В процессе" },
  { value: SessionState.Paused, label: "На паузе" },
  { value: SessionState.Finished, label: "Завершена / отчет готов" },
  { value: SessionState.Processing, label: "Готовится отчет" },
  { value: SessionState.Canceled, label: "Отменена" },
  { value: SessionState.Failed, label: "Ошибка" },
];

export const questionTypeOptions = [
  { value: QuestionType.Technical, label: "Technical" },
  { value: QuestionType.Behavioral, label: "Behavioral" },
  { value: QuestionType.General, label: "General" },
];

export const questionStatusOptions = [
  { value: QuestionStatus.Active, label: "Active" },
  { value: QuestionStatus.Disabled, label: "Disabled" },
];

export const userStatusOptions = [
  { value: UserStatus.Active, label: "Active" },
  { value: UserStatus.Blocked, label: "Blocked" },
  { value: UserStatus.Deleted, label: "Deleted" },
];
