import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Form from '../../pages/Form';

beforeEach(() => {
  jest.spyOn(global, 'fetch').mockImplementation((input) => {
    const url = String(input);

    // GET /events - eventos pai
    if (url.endsWith('/events')) {
      return Promise.resolve({
        ok: true,
        json: async () => [],
      } as Response);
    }

    // POST / PUT - submit
    return Promise.resolve({
      ok: true,
      json: async () => ({}),
    } as Response);
  });

  localStorage.setItem('token', 'fake-token');
});

afterEach(() => {
  jest.restoreAllMocks();
});

// Helpers
function fillBasicForm(container: HTMLElement) {
  fireEvent.change(screen.getByPlaceholderText(/festival cultural/i), {
    target: { value: 'Evento Teste' },
  });

  fireEvent.change(screen.getByPlaceholderText(/descreva o evento/i), {
    target: { value: 'Descrição do evento' },
  });

  fireEvent.change(container.querySelector('input[name="data"]')!, {
    target: { value: '2026-01-10T10:00' },
  });

  fireEvent.change(container.querySelector('select[name="categoria"]')!, {
    target: { value: 'cultura' },
  });
}
// Tests
describe('Form Page', () => {
  test('renderiza formulário de cadastro', async () => {
    render(<Form />);

    expect(await screen.findByText(/cadastro de evento/i)).toBeInTheDocument();
  });

  test('exibe loading ao enviar formulário', async () => {
    const { container } = render(<Form />);

    fillBasicForm(container);

    fireEvent.click(screen.getByText(/cadastrar evento/i));

    expect(await screen.findByText(/enviando/i)).toBeInTheDocument();
  });

  test('exibe sucesso ao cadastrar evento', async () => {
    const { container } = render(<Form />);

    fillBasicForm(container);

    fireEvent.click(screen.getByText(/cadastrar evento/i));

    expect(
      await screen.findByText(/evento cadastrado com sucesso/i)
    ).toBeInTheDocument();
  });

  test('exibe erro quando API retorna erro', async () => {
    (global.fetch as jest.Mock).mockImplementation(
      (_input: RequestInfo, init?: RequestInit) => {
        // GET inicial → lista de eventos pai
        if (!init || init.method === 'GET') {
          return Promise.resolve({
            ok: true,
            json: async () => [],
          } as Response);
        }

        // POST → erro da API
        if (init.method === 'POST') {
          return Promise.resolve({
            ok: false,
            json: async () => ({ error: 'Erro ao cadastrar evento' }),
          } as Response);
        }

        return Promise.reject(new Error('Método não tratado'));
      }
    );

    const { container } = render(<Form />);

    fireEvent.change(screen.getByPlaceholderText(/festival cultural/i), {
      target: { value: 'Evento Teste' },
    });

    fireEvent.change(screen.getByPlaceholderText(/descreva o evento/i), {
      target: { value: 'Descrição do evento' },
    });

    fireEvent.change(container.querySelector('input[name="data"]')!, {
      target: { value: '2026-01-10T10:00' },
    });

    fireEvent.change(container.querySelector('select[name="categoria"]')!, {
      target: { value: 'cultura' },
    });

    fireEvent.click(screen.getByText(/cadastrar evento/i));

    expect(
      await screen.findByText(/erro ao cadastrar evento/i)
    ).toBeInTheDocument();
  });

  test('renderiza formulário em modo edição', async () => {
    render(
      <Form
        editingEvent={{
          id: '1',
          nome: 'Evento Editado',
          descricao: 'Descrição',
          data: '2026-01-01T12:00:00.000Z',
          categoria: 'turismo',
        }}
      />
    );

    expect(await screen.findByText(/editar evento/i)).toBeInTheDocument();

    // espera o estado assíncrono
    expect(
      await screen.findByDisplayValue('Evento Editado')
    ).toBeInTheDocument();
  });

  test('chama onSuccess após sucesso na edição', async () => {
    const onSuccess = jest.fn();

    render(
      <Form
        onSuccess={onSuccess}
        editingEvent={{
          id: '1',
          nome: 'Evento Editado',
          descricao: 'Descrição',
          data: '2026-01-01T12:00:00.000Z',
          categoria: 'turismo',
        }}
      />
    );

    fireEvent.click(await screen.findByText(/atualizar evento/i));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  test('chama onCancel ao clicar em cancelar', async () => {
    const onCancel = jest.fn();

    render(
      <Form
        onCancel={onCancel}
        editingEvent={{
          id: '1',
          nome: 'Evento Editado',
          descricao: 'Descrição',
          data: '2026-01-01T12:00:00.000Z',
          categoria: 'turismo',
        }}
      />
    );

    fireEvent.click(await screen.findByText(/cancelar/i));

    expect(onCancel).toHaveBeenCalled();
  });
});
