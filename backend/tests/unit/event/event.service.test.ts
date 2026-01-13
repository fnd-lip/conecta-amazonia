import { EventService } from '../../../src/modules/event/event.service';

describe('EventService', () => {
  let eventService: EventService;
  let eventRepositoryMock: any;

  beforeEach(() => {
    eventRepositoryMock = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      updateById: jest.fn(),
      deleteById: jest.fn(),
      findByUserId: jest.fn(),
    };

    eventService = new EventService(eventRepositoryMock);
  });

  it('deve criar evento com dados válidos', async () => {
    const eventData = {
      nome: 'Evento Teste',
      descricao: 'Descrição',
      categoria: 'cultura',
      data: new Date('2025-12-02T10:00'),
      userId: 'user-123',
    };

    eventRepositoryMock.create.mockResolvedValue({ id: '1', ...eventData });

    const result = await eventService.createEvent(eventData);

    expect(eventRepositoryMock.create).toHaveBeenCalledWith({
      ...eventData,
      data: expect.any(Date),
    });
    expect(result.id).toBe('1');
  });

  it('deve lançar erro se faltar userId', async () => {
    const eventData: any = {
      nome: 'Evento',
      descricao: 'desc',
      categoria: 'cat',
      data: new Date(),
    };

    await expect(eventService.createEvent(eventData)).rejects.toThrow(
      'Usuário não identificado!'
    );
  });

  it('deve lançar erro se faltar campo obrigatório (nome)', async () => {
    await expect(
      eventService.createEvent({
        nome: '',
        descricao: 'Desc',
        categoria: 'Cat',
        data: new Date(),
        userId: '123',
      })
    ).rejects.toThrow('Preencha os campos obrigatórios!');
  });

  it('deve lançar erro se a data for inválida', async () => {
    await expect(
      eventService.createEvent({
        nome: 'Evento',
        descricao: 'desc',
        categoria: 'cat',
        data: new Date('invalid-date'),
        userId: '123',
      })
    ).rejects.toThrow('Data inválida!');
  });

  it('deve buscar evento por id', async () => {
    eventRepositoryMock.findById.mockResolvedValue({ id: '1', nome: 'Evento' });
    const result = await eventService.getEventById('1');
    expect(result.id).toBe('1');
  });

  it('deve lançar erro se evento não existir', async () => {
    eventRepositoryMock.findById.mockResolvedValue(null);
    await expect(eventService.getEventById('2')).rejects.toThrow(
      'Evento não encontrado!'
    );
  });

  // --- Landing Page ---

  describe('listLandingPageEvents', () => {
    it('deve usar o limite padrão (4) se nenhum for informado', async () => {
      eventRepositoryMock.findAll.mockResolvedValue([]);

      await eventService.listLandingPageEvents();

      expect(eventRepositoryMock.findAll).toHaveBeenCalledWith(4);
    });

    it('deve usar o limite informado via parâmetro', async () => {
      eventRepositoryMock.findAll.mockResolvedValue([]);

      await eventService.listLandingPageEvents(8);

      expect(eventRepositoryMock.findAll).toHaveBeenCalledWith(8);
    });
  });
});
