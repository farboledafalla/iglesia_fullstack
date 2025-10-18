import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import AttemptUI from '../components/AttemptUI';

export default function LessonView() {
  const { courseId, lessonId } = useParams();
  const [lesson, setLesson] = useState(null);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    async function load() {
      const res = await api.get(`/lecciones/${lessonId}`);
      setLesson(res.data[0]);
      const qres = await api.get(`/preguntas/leccion/${lessonId}`);
      setQuestions(qres.data);
    }
    load();
  }, [lessonId]);

  if (!lesson) return <div>Cargando lección...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">{lesson.titulo}</h1>
      <div className="mt-4">
        <AttemptUI questions={questions} lessonId={lessonId} />
      </div>
    </div>
  );
}
