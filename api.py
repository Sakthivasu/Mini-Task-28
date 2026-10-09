from datetime import datetime, timedelta
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import mysql.connector
from passlib.context import CryptContext
import jwt

SECRET_KEY = "edabip_super_secret_key_change_me"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

app = FastAPI(title="EDABIP Mini Enterprise API")

# CORS Middleware 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

def get_db():
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="12345",
        database="edabip_db"
    )
    try:
        yield conn
    finally:
        conn.close()

# Token verification dependency for protected routes
def verify_token(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        return username
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

class UserSignup(BaseModel):
    username: str
    email: str
    password: str

class TransactionCreate(BaseModel):
    customer_name: str
    category: str
    amount: float
    status: str
    transaction_date: str

@app.post("/api/auth/signup")
def signup(user: UserSignup, db = Depends(get_db)):
    cursor = db.cursor()
    hashed_password = pwd_context.hash(user.password)
    try:
        cursor.execute(
            "INSERT INTO users (username, email, password_hash) VALUES (%s, %s, %s)",
            (user.username, user.email, hashed_password)
        )
        db.commit()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"User already exists or invalid data: {str(e)}")
    finally:
        cursor.close()
    return {"message": "User registered successfully"}

@app.post("/api/auth/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db = Depends(get_db)):
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE username = %s", (form_data.username,))
    user = cursor.fetchone()
    cursor.close()

    if not user or not pwd_context.verify(form_data.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    expire = datetime.utcnow() + access_token_expires
    to_encode = {"sub": user["username"], "exp": expire}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    return {"access_token": encoded_jwt, "token_type": "bearer"}

@app.get("/api/kpi")
def get_kpi_data(db = Depends(get_db)):
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT SUM(amount) as total_revenue, COUNT(DISTINCT customer_name) as active_users, COUNT(*) as total_orders FROM transactions")
    kpi = cursor.fetchone()
    cursor.execute("SELECT DATE_FORMAT(transaction_date, '%Y-%m') as month, SUM(amount) as revenue FROM transactions GROUP BY month ORDER BY month")
    chart_data = cursor.fetchall()
    cursor.close()
    return {
        "kpi": {
            "total_revenue": float(kpi["total_revenue"] or 0),
            "active_users": kpi["active_users"] or 0,
            "total_orders": kpi["total_orders"] or 0
        },
        "chartData": chart_data
    }

@app.get("/api/transactions")
def get_transactions(search: str = "", category: str = "", db = Depends(get_db)):
    cursor = db.cursor(dictionary=True)
    query = "SELECT * FROM transactions WHERE 1=1"
    params = []
    if search:
        query += " AND (customer_name LIKE %s OR status LIKE %s)"
        params.extend([f"%{search}%", f"%{search}%"])
    if category and category != "All":
        query += " AND category = %s"
        params.append(category)
    cursor.execute(query, tuple(params))
    rows = cursor.fetchall()
    cursor.close()
    return rows

@app.post("/api/transactions")
def add_transaction(tx: TransactionCreate, user: str = Depends(verify_token), db = Depends(get_db)):
    cursor = db.cursor()
    query = """
        INSERT INTO transactions (customer_name, category, amount, status, transaction_date)
        VALUES (%s, %s, %s, %s, %s)
    """
    cursor.execute(query, (tx.customer_name, tx.category, tx.amount, tx.status, tx.transaction_date))
    db.commit()
    cursor.close()
    return {"message": "Transaction added successfully"}