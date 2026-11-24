# factorial: int -> int
# Pre: n >= 0
def factorial(n):
    if n == 0:
        return 1
    return n * factorial(n - 1)


assert factorial(0) == 1
assert factorial(5) == 120
print(factorial(5))
