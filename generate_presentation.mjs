import PptxGenJS from 'pptxgenjs';

const pptx = new PptxGenJS();
const addBulletSlide = (title, items) => {
  const slide = pptx.addSlide();
  slide.addText(title, { x: 0.5, y: 0.3, fontSize: 32, bold: true, color: '363636' });
  const textItems = items.map((item) => ({ text: item }));
  slide.addText(textItems, {
    x: 0.5,
    y: 1.2,
    w: '90%',
    fontSize: 20,
    color: '333333',
    bullet: true,
    margin: 0.1,
  });
};

addBulletSlide('ConectArena - Apresentação', [
  'Plataforma de gerenciamento de eventos e vendas de ingressos em arena',
  'Arquitetura full-stack com React/Vite e Spring Boot',
  'Foco em usabilidade para público e administradores',
]);

addBulletSlide('O Problema', [
  'Dificuldade de centralizar eventos e venda de ingressos',
  'Gestão de eventos e controle de público pouco acessível',
  'Falta de espaço colaborativo para comunidade e engajamento',
]);

addBulletSlide('A Solução Desenvolvida', [
  'Marketplace de eventos com compra de ingressos e perfil de usuário',
  'Comunidade para posts, comentários e interação entre fãs',
  'Administração de eventos com criação de shows e métricas',
  'Interface responsiva construída com componentes modernos',
]);

addBulletSlide('Arquitetura do Software', [
  'Frontend React + Vite consumindo API REST do backend',
  'Backend Spring Boot com autenticação JWT e controle de eventos',
  'Banco de dados H2 local para persistência de eventos e usuários',
  'Divisão em interface, lógica de negócio e persistência',
]);

addBulletSlide('Características do Produto', [
  'Login, cadastro, recuperação de senha e autenticação JWT',
  'Página de detalhes de evento e fluxo de checkout',
  'Perfil do usuário, ingressos e favoritos',
  'Área de comunidade, comentários e feed de posts',
]);

addBulletSlide('Público-Alvo', [
  'Participantes interessados em eventos e shows locais',
  'Organizadores e administradores de arenas',
  'Usuários que desejam acompanhar métricas e tours',
]);

addBulletSlide('Fluxo de Trabalho', [
  'Planejamento com histórias de usuário documentadas',
  'Desenvolvimento em frontend e backend paralelos',
  'Gerência de configuração via Git e pastas separadas',
  'Testes de integração manual e validação de rotas',
]);

addBulletSlide('Ferramentas Utilizadas', [
  'Java 17 + Spring Boot 4.0.5',
  'React 18 + Vite 6 + Tailwind CSS',
  'H2 Database, Maven Wrapper, pnpm/npm',
  'Figma para design e prototipação de interface',
]);

addBulletSlide('Links Relevantes', [
  'Spring Boot: https://spring.io/projects/spring-boot',
  'React: https://react.dev/',
  'Vite: https://vitejs.dev/',
  'Figma: https://www.figma.com/',
]);

addBulletSlide('Lições Aprendidas', [
  'Importância do planejamento visual e das histórias de usuário',
  'Divisão clara de responsabilidades entre frontend e backend',
  'Comunicação constante para resolver bugs e sincronizar entregas',
  'Necessidade de testes para garantir exibição correta de dados',
]);

const slide = pptx.addSlide();
slide.addText('Demonstração Rápida do Produto', { x: 0.5, y: 0.3, fontSize: 32, bold: true, color: '363636' });
slide.addText('Assista à demonstração curta em vídeo:', { x: 0.5, y: 1.2, fontSize: 20, color: '333333' });
slide.addText('https://youtu.be/6cm3xAS81DU', {
  x: 0.5,
  y: 1.8,
  fontSize: 18,
  color: '1155cc',
  hyperlink: { url: 'https://youtu.be/6cm3xAS81DU' },
});
slide.addText('Mostra login, eventos, checkout e comunidade', { x: 0.5, y: 2.4, fontSize: 18, color: '333333' });

await pptx.writeFile({ fileName: 'ConectArena_Apresentacao.pptx' });
console.log('Apresentação gerada: ConectArena_Apresentacao.pptx');
