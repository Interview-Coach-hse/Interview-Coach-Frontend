import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { InterviewDirection, InterviewLevel, QuestionStatus, QuestionType } from "@/api/generated/schema";
import { useAdminQuestions } from "@/features/admin/hooks/useAdmin";
import { directionOptions, levelOptions, questionStatusOptions, questionTypeOptions } from "@/shared/lib/options";
import { Button, Card, ErrorState, Input, Loader, PageHeader, Select } from "@/shared/ui";

const schema = z.object({
  text: z.string().min(10, "Минимум 10 символов"),
  questionType: z.nativeEnum(QuestionType),
  difficulty: z.nativeEnum(InterviewLevel),
  direction: z.nativeEnum(InterviewDirection),
  status: z.nativeEnum(QuestionStatus),
});

export function AdminQuestionsPage() {
  const { listQuery, createMutation, deleteMutation } = useAdminQuestions();
  const { register, handleSubmit, reset } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      questionType: QuestionType.Technical,
      difficulty: InterviewLevel.Junior,
      direction: InterviewDirection.Backend,
      status: QuestionStatus.Active,
    },
  });

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
            await createMutation.mutateAsync(values);
            reset();
          })}
        >
          <Input label="Текст вопроса" {...register("text")} />
          <div className="grid grid-2">
            <Select label="Тип" options={questionTypeOptions} {...register("questionType")} />
            <Select label="Уровень" options={levelOptions.filter((item) => item.value)} {...register("difficulty")} />
            <Select label="Направление" options={directionOptions.filter((item) => item.value)} {...register("direction")} />
            <Select label="Статус" options={questionStatusOptions} {...register("status")} />
          </div>
          <Button type="submit" disabled={createMutation.isPending}>
            Добавить вопрос
          </Button>
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
                  <Button variant="ghost" onClick={() => deleteMutation.mutate(item.id!)}>
                    Удалить
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
