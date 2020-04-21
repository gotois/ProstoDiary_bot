-- fixme взять из CreativeWork
-- категории поддерживаемый черзе словарь schema.org (должны быть продублированы в Search ассистенте в Dialogflow Intents)
CREATE
    TYPE SCHEMA AS ENUM (
        'CreativeWork'
        ,'text' --> Article
        ,'video' --> Movie
        ,'photo' --> Photograph
        ,'location'
        ,'search' --> WebPage?
        ,'script' --> ???
        ,'weather' --> ???
        ,'todo' --> ExercisePlan
        ,'work' --> CreativeWork
        ,'idea' --> CreativeWork
        ,'buy' --> ???
        ,'sex' --> ???
        ,'contract' --> ???
        ,'love' --> ???
        ,'eat' --> ???
        ,'finance' --> ???
        ,'fitness' --> ???
        ,'health' --> ???
        ,'meet' --> ???
        ,'pain' --> ???
        ,'weight' --> ???
        ,'height' -- Смена роста
        ,'family' -- Изменения в Семья
        ,'job' -- Здесь же смена уровня дохода | новая цели в карьере
        ,'birthday' -- Указание День рождения
        ,'hobby'
        ,'social' -- Новое сообщество
        ,'mood' -- настроение и твореческое выражение
    )
;

ALTER TYPE SCHEMA ADD VALUE 'Place'
