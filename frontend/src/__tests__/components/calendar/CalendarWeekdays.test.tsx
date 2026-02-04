import { render, screen } from "@testing-library/react";
import CalendarWeekdays from "../../../components/calendar/CalendarWeekdays";

describe("CalendarWeekdays", () => {
  test("renderiza os 7 dias da semana em português", () => {
    render(<CalendarWeekdays />);

    const labels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

    labels.forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  test("renderiza exatamente 7 elementos de dia da semana", () => {
    const { container } = render(<CalendarWeekdays />);

    const items = container.querySelectorAll(".cal-weekday");
    expect(items.length).toBe(7);
  });

  test("possui o container com classe cal-weekdays", () => {
    const { container } = render(<CalendarWeekdays />);

    const root = container.querySelector(".cal-weekdays");
    expect(root).toBeInTheDocument();
  });
});
