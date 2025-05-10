import { invariant, toValidProjectId } from "@ceramic/common";
import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import { db } from "src/db";

export const Route = createFileRoute("/welcome/new-project")({
  component: RouteComponent,
  validateSearch: (
    search: Record<string, unknown>
  ): { projectPath: string } => ({ projectPath: search.projectPath as string }),
});

function RouteComponent() {
  const { projectPath } = Route.useSearch();

  const form = useForm({
    defaultValues: {
      projectName: "",
      projectIdentifier: "",
    },
    onSubmit: async ({ value }) => {
      const createdProjectPath = await window.electronApi?.createNewProject({
        projectName: value.projectName,
        projectIdentifier: value.projectIdentifier,
        projectPath,
      });

      invariant(createdProjectPath);

      await db.recentProjects.add({
        path: createdProjectPath,
        name: value.projectName,
      });

      window.electronApi?.openProject({
        project: { path: createdProjectPath },
      });
    },
  });

  return (
    <div className="window-drag w-screen h-screen p-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="flex flex-col h-full"
      >
        <div className="flex-1 flex flex-col justify-center border border-neutral-300">
          <form.Field
            name="projectName"
            validators={{
              onChange: ({ value }) => {
                return !value;
              },
            }}
            children={(field) => {
              return (
                <div className="grid grid-cols-[200px_400px] auto-rows-max gap-x-4 gap-y-4 items-center">
                  <label htmlFor={field.name} className="text-right text-sm">
                    Project Name:
                  </label>
                  <input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.handleChange(value);
                      form.setFieldValue(
                        "projectIdentifier",
                        toValidProjectId({ from: value })
                      );
                    }}
                    autoFocus
                    className="text-sm rounded-md px-3 pt-0.75 pb-1 outline-1 -outline-offset-1 outline-neutral-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-emerald-300"
                  />
                  <span
                    className="text-right data-[disabled=true]:text-neutral-400 text-sm"
                    data-disabled={!field.state.value}
                  >
                    Project Identifier:
                  </span>
                  <form.Subscribe
                    selector={(state) => state.values.projectIdentifier}
                    children={(projectIdentifier) => (
                      <span className="text-sm">{projectIdentifier}</span>
                    )}
                  ></form.Subscribe>
                </div>
              );
            }}
          />
        </div>

        <div className="flex justify-between pt-4 pb-1">
          <button
            type="button"
            className="border-neutral-200 shadow active:shadow-xs px-3 py-1 rounded-md text-sm focus:outline-2 focus:outline-emerald-300 focus:outline-offset-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-emerald-500 shadow active:shadow-xs px-3 py-1 rounded-md text-sm text-white active:text-emerald-50 focus:outline-2 focus:outline-emerald-300 focus:outline-offset-1"
          >
            Create Project
          </button>
        </div>
      </form>
    </div>
  );
}
