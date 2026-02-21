# # ml/train_model.py
# import pandas as pd
# from surprise import Dataset, Reader, KNNWithMeans
# from surprise.model_selection import train_test_split
# import pymysql
# from sqlalchemy import create_engine
# import os
#
# # ======================
# # 配置数据库连接（请根据你的本地环境修改）
# # ======================
# DB_USER = "root"
# DB_PASSWORD = "031020"  # ← 替换为你的 MySQL 密码
# DB_HOST = "localhost"
# DB_PORT = 3306
# DB_NAME = "tourism_recommender"
#
# # 构建 SQLAlchemy 引擎（用于写入推荐结果）
# engine = create_engine(f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}")
#
#
# def load_ratings_from_db():
#     """从 MySQL 读取用户-景点评分数据"""
#     connection = pymysql.connect(
#         host=DB_HOST,
#         user=DB_USER,
#         password=DB_PASSWORD,
#         database=DB_NAME,
#         charset='utf8mb4'
#     )
#     try:
#         # 假设你的评分表名为 `ratings`，字段：user_id, item_id, rating
#         query = "SELECT user_id, item_id, rating FROM ratings"
#         df = pd.read_sql(query, connection)
#         print(f"✅ 成功加载 {len(df)} 条评分记录")
#         return df
#     finally:
#         connection.close()
#
#
# def train_and_generate_recommendations():
#     """训练 User-CF 模型并生成推荐"""
#     df = load_ratings_from_db()
#
#     if df.empty:
#         print("⚠️  评分数据为空，跳过推荐生成")
#         return
#
#     # 配置 Surprise Reader（评分范围 1～5）
#     reader = Reader(rating_scale=(1, 5))
#     data = Dataset.load_from_df(df[['user_id', 'item_id', 'rating']], reader)
#
#     # 全量训练（不划分测试集，因是离线生产）
#     trainset = data.build_full_trainset()
#
#     # 使用基于用户的协同过滤（User-CF）
#     algo = KNNWithMeans(
#         k=40,  # 考虑最相似的40个用户
#         sim_options={'name': 'cosine', 'user_based': True}
#     )
#     algo.fit(trainset)
#
#     # 获取所有唯一用户
#     unique_users = df['user_id'].unique()
#     recommendations = []
#
#     for user in unique_users:
#         # 获取该用户未评分的所有景点
#         user_items = set(df[df['user_id'] == user]['item_id'])
#         all_items = set(df['item_id'].unique())
#         items_to_predict = list(all_items - user_items)
#
#         # 预测评分
#         predictions = [algo.predict(user, item) for item in items_to_predict]
#         # 按预测评分降序排序，取 Top-5
#         top5 = sorted(predictions, key=lambda x: x.est, reverse=True)[:5]
#
#         for pred in top5:
#             recommendations.append({
#                 'user_id': pred.uid,
#                 'item_id': pred.iid,
#                 'predicted_score': round(pred.est, 2)
#             })
#
#     # 转为 DataFrame 并写入数据库
#     rec_df = pd.DataFrame(recommendations)
#     if not rec_df.empty:
#         # 清空旧推荐（可选）
#         with engine.connect() as conn:
#             conn.execute("DELETE FROM recommendations")
#         # 写入新推荐
#         rec_df.to_sql('recommendations', con=engine, if_exists='append', index=False)
#         print(f"✅ 成功生成并保存 {len(rec_df)} 条推荐记录")
#     else:
#         print("⚠️  无新推荐生成")
#
#
# if __name__ == "__main__":
#     try:
#         train_and_generate_recommendations()
#     except Exception as e:
#         print(f"❌ 推荐生成失败: {e}")

# ml/train_model.py
import pandas as pd
from surprise import Dataset, Reader, KNNWithMeans
from collections import defaultdict

# 1. 加载 ratings.csv
df = pd.read_csv("ratings.csv")
print(f"✅ 加载 {len(df)} 条评分数据")
print(df.head())

# 2. 配置 Surprise 数据集
reader = Reader(rating_scale=(1, 5))
data = Dataset.load_from_df(df[['user_id', 'item_id', 'rating']], reader)
trainset = data.build_full_trainset()

# 3. 训练 User-Based 协同过滤模型
algo = KNNWithMeans(
    k=40,
    sim_options={'name': 'cosine', 'user_based': True}
)
algo.fit(trainset)

# 4. 为每个用户生成 Top-5 推荐
all_items = df['item_id'].unique()
all_users = df['user_id'].unique()

recommendations = []

for user in all_users:
    # 找出该用户已评分的景点
    user_items = set(df[df['user_id'] == user]['item_id'])
    # 候选推荐：未评分的景点
    items_to_predict = [item for item in all_items if item not in user_items]

    # 预测评分
    predictions = [algo.predict(user, item) for item in items_to_predict]
    # 按预测分排序，取 Top-5
    top5 = sorted(predictions, key=lambda x: x.est, reverse=True)[:5]

    for pred in top5:
        recommendations.append({
            'user_id': pred.uid,
            'item_id': pred.iid,
            'predicted_score': round(pred.est, 2)
        })

# 5. 保存到 recommendations.csv
rec_df = pd.DataFrame(recommendations)
rec_df.to_csv("recommendations.csv", index=False, encoding="utf-8")
print(f"✅ 已生成 {len(rec_df)} 条推荐，保存至 recommendations.csv")
print(rec_df.head(10))