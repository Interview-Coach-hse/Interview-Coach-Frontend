import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { InterviewDirection, InterviewLevel, QuestionStatus, QuestionType } from "@/api/generated/schema";
import { useAdminQuestions } from "@/features/admin/hooks/useAdmin";
import { directionOptions, levelOptions, questionStatusOptions, questionTypeOptions } from "@/shared/lib/options";
import { Button, Card, ErrorState, Loader, PageHeader, Select, Textarea } from "@/shared/ui";

const schema = z.object({
  text: z.string().min(10, "Минимум 10 символов"),
  questionType: z.nativeEnum(QuestionType),
  difficulty: z.nativeEnum(InterviewLevel),
  direction: z.nativeEnum(InterviewDirection),
  status: z.nativeEnum(QuestionStatus),
});

export function AdminQuestionsPage() {
  const { listQuery, createMutation, updateMutation, deleteMutation } = useAdminQuestions();
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      text: "",
      questionType: QuestionType.Technical,
      difficulty: InterviewLevel.Junior,
      direction: InterviewDirection.Backend,
      status: QuestionStatus.Active,
    },
  });

  const resetForm = () => {
    setEditingQuestionId(null);
    reset({
      text: "",
      questionType: QuestionType.Technical,
      difficulty: InterviewLevel.Junior,
      direction: InterviewDirection.Backend,
      status: QuestionStatus.Active,
    });
  };

  if (listQuery.isLoading) {
    return <Loader />;
  }

  if (listQuery.isError) {
    return <ErrorState error={listQuery.error} retry={() => listQuery.refetch()} />;
  }

  return (
    <div className="grid">
      <PageHeader eyebrow="Admin Content" title="Вопросы" />
      <Card>
        <form
          onSubmit={handleSubmit(async (values) => {
            if (editingQuestionId) {
              await updateMutation.mutateAsync({ id: editingQuestionId, payload: values });
            } else {
              await createMutation.mutateAsync(values);
            }

            resetForm();
          })}
        >
          <Textarea label="Текст вопроса" error={errors.text?.message} rows={4} {...register("text")} />
          <div className="grid grid-2">
            <Select label="Тип" error={errors.questionType?.message} options={questionTypeOptions} {...register("questionType")} />
            <Select
              label="Уровень"
              error={errors.difficulty?.message}
              options={levelOptions.filter((item) => item.value)}
              {...register("difficulty")}
            />
            <Select
              label="Направление"
              error={errors.direction?.message}
              options={directionOptions.filter((item) => item.value)}
              {...register("direction")}
            />
            <Select label="Статус" error={errors.status?.message} options={questionStatusOptions} {...register("status")} />
          </div>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {editingQuestionId ? "Сохранить изменения" : "Добавить вопрос"}
            </Button>
            {editingQuestionId ? (
              <Button type="button" variant="secondary" onClick={resetForm}>
                Отмена
              </Button>
            ) : null}
          </div>
        </form>
      </Card>
      <Card>
        <table className="data-table">
          <thead>
            <tr>
              <th>Текст</th>
              <th>Тип</th>
              <th>Уровень</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {listQuery.data?.map((item) => (
              <tr key={item.id}>
                <td>{item.text}</td>
                <td>{item.questionType}</td>
                <td>{item.difficulty}</td>
                <td>
                  <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", flexWrap: "wrap" }}>
                    <Button
                      variant="ghost"
                      type="button"
                      onClick={() => {
                        setEditingQuestionId(item.id!);
                        reset({
                          text: item.text ?? "",
                          questionType: item.questionType ?? QuestionType.Technical,
                          difficulty: item.difficulty ?? InterviewLevel.Junior,
                          direction: item.direction ?? InterviewDirection.Backend,
                          status: item.status ?? QuestionStatus.Active,
                        });
                      }}
                    >
                      Редактировать
                    </Button>
                    <Button variant="ghost" type="button" onClick={() => deleteMutation.mutate(item.id!)}>
                      Удалить
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
