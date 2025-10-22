const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

const SCOPES = [
  'https://www.googleapis.com/auth/fitness.activity.read',
  'https://www.googleapis.com/auth/fitness.body.read',
].join(' ');

export function getAuthUrl() {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID!,
    redirect_uri: GOOGLE_REDIRECT_URI!,
    response_type: 'code',
    scope: SCOPES,
    access_type: 'offline',
    prompt: 'consent',
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function getTokens(code: string) {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID!,
      client_secret: GOOGLE_CLIENT_SECRET!,
      redirect_uri: GOOGLE_REDIRECT_URI!,
      grant_type: 'authorization_code',
    }),
  });

  return response.json();
}

export async function refreshAccessToken(refreshToken: string) {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: GOOGLE_CLIENT_ID!,
      client_secret: GOOGLE_CLIENT_SECRET!,
      grant_type: 'refresh_token',
    }),
  });

  return response.json();
}

export async function getStepsAndCalories(accessToken: string, date: Date = new Date()) {
  // Set time range for the day
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const startTimeMillis = startOfDay.getTime();
  const endTimeMillis = endOfDay.getTime();

  // Fetch steps
  const stepsResponse = await fetch(
    'https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        aggregateBy: [{
          dataTypeName: 'com.google.step_count.delta',
          dataSourceId: 'derived:com.google.step_count.delta:com.google.android.gms:estimated_steps',
        }],
        bucketByTime: { durationMillis: endTimeMillis - startTimeMillis },
        startTimeMillis,
        endTimeMillis,
      }),
    }
  );

  const stepsData = await stepsResponse.json();

  // Fetch calories
  const caloriesResponse = await fetch(
    'https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        aggregateBy: [{
          dataTypeName: 'com.google.calories.expended',
          dataSourceId: 'derived:com.google.calories.expended:com.google.android.gms:merge_calories_expended',
        }],
        bucketByTime: { durationMillis: endTimeMillis - startTimeMillis },
        startTimeMillis,
        endTimeMillis,
      }),
    }
  );

  const caloriesData = await caloriesResponse.json();

  // Extract values
  let steps = 0;
  let calories = 0;

  if (stepsData.bucket?.[0]?.dataset?.[0]?.point?.[0]?.value?.[0]?.intVal) {
    steps = stepsData.bucket[0].dataset[0].point[0].value[0].intVal;
  }

  if (caloriesData.bucket?.[0]?.dataset?.[0]?.point?.[0]?.value?.[0]?.fpVal) {
    calories = Math.round(caloriesData.bucket[0].dataset[0].point[0].value[0].fpVal);
  }

  return { steps, calories };
}
