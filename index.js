// Importar Tiptap e extensões via ESM
import { Editor } from 'https://esm.sh/@tiptap/core@2.0.3'
import StarterKit from 'https://esm.sh/@tiptap/starter-kit@2.0.3'
import Placeholder from 'https://esm.sh/@tiptap/extension-placeholder@2.0.3'
import {Image as img}  from 'https://esm.sh/@tiptap/extension-image@2.0.3'
import Link from 'https://esm.sh/@tiptap/extension-link@2.0.3'

document.addEventListener('DOMContentLoaded', function() {
  // Inicializar o editor Tiptap
  const editor = new Editor({
    element: document.getElementById('markdown-input'),
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Comece a escrever...'
      }),
      img,
      Link
    ],
    content: localStorage.getItem('markdown-content') || '',
    onUpdate: ({ editor }) => {
      // Salvar o conteúdo quando houver mudanças
      const html = editor.getHTML();
      localStorage.setItem('markdown-content', html);
    }
  });

  // Configurar os botões da barra de menu
  document.querySelectorAll('.menu-bar button').forEach(button => {
    const action = button.dataset.action;
    
    if (action) {
      button.addEventListener('click', () => {
        if (action === 'heading') {
          const level = parseInt(button.dataset.level);
          editor.chain().focus().toggleHeading({ level }).run();
        } else if (action === 'bold') {
          editor.chain().focus().toggleBold().run();
        } else if (action === 'italic') {
          editor.chain().focus().toggleItalic().run();
        } else if (action === 'bulletList') {
          editor.chain().focus().toggleBulletList().run();
        } else if (action === 'orderedList') {
          editor.chain().focus().toggleOrderedList().run();
        } else if (action === 'blockquote') {
          editor.chain().focus().toggleBlockquote().run();
        } else if (action === 'code') {
          editor.chain().focus().toggleCode().run();
        } else if (action === 'undo') {
          editor.chain().focus().undo().run();
        } else if (action === 'redo') {
          editor.chain().focus().redo().run();
        }
      });
      
      // Atualizar estado ativo dos botões
      editor.on('update', () => {
        if (action === 'heading') {
          const level = parseInt(button.dataset.level);
          button.classList.toggle('is-active', editor.isActive('heading', { level }));
        } else if (['bold', 'italic', 'bulletList', 'orderedList', 'blockquote', 'code'].includes(action)) {
          button.classList.toggle('is-active', editor.isActive(action));
        }
      });
    }
  });

  // Configuração do Canvas para desenho
  const canvas = document.getElementById('drawing-canvas');
  const ctx = canvas.getContext('2d');
  let isDrawing = false;

  // Ajustar o tamanho do canvas para preencher a janela
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Restaurar desenho salvo após redimensionar
    const savedDrawing = localStorage.getItem('drawing');
    if (savedDrawing) {
      const img = new Image();
      img.src = savedDrawing;
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
    }
  }

  // Inicializar o tamanho do canvas
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Funções de desenho
  const startDrawing = (e) => {
    isDrawing = true;
    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.moveTo(e.offsetX, e.offsetY);
  };

  const draw = (e) => {
    if (isDrawing) {
      ctx.lineTo(e.offsetX, e.offsetY);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (isDrawing) {
      isDrawing = false;
      ctx.closePath();
      
      // Salvar o desenho quando o usuário parar de desenhar
      const drawingData = canvas.toDataURL();
      localStorage.setItem('drawing', drawingData);
    }
  };

  // Eventos para mouse e touch
  canvas.addEventListener('pointerdown', startDrawing);
  canvas.addEventListener('pointermove', draw);
  canvas.addEventListener('pointerup', stopDrawing);
  canvas.addEventListener('pointerout', stopDrawing);

  // Eventos de touch
  canvas.addEventListener('touchstart', startDrawing);
  canvas.addEventListener('touchmove', draw);
  canvas.addEventListener('touchend', stopDrawing);
  canvas.addEventListener('touchcancel', stopDrawing);

  // Eventos de fallback para navegadores mais antigos
  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseout', stopDrawing);

  // Carregar desenho salvo
  const savedDrawing = localStorage.getItem('drawing');
  if (savedDrawing) {
    const img = new Image();
    img.src = savedDrawing;
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
    };
  }

  // Alternar modo de desenho
  const drawingButton = document.getElementById('drawing-button');
  drawingButton.addEventListener('click', () => {
    canvas.classList.toggle('active');
  });
});